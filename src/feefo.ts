import fs from 'fs'

type FeefoProductReview = {
    rating: number
    sku: string
    review_count: number
}

const PAGE_SIZE = 100

async function getFeefoProductReviews(page: number = 1): Promise<FeefoProductReview[] | []>  {
    const url = new URL('https://api.feefo.com/api/11/products/ratings')

    url.searchParams.set('merchant_identifier', 'motta-living')
    url.searchParams.set('review_count', 'true')
    url.searchParams.set('page_size', String(PAGE_SIZE))
    url.searchParams.set('page', String(page))
    url.searchParams.set('since_period', 'all')

    return await fetch(url)
        .then(res => res.json())
        .then(data => {
            return data.products || []
        })
}

async function generateCsv() {
    let fetchedAll = false
    let page = 1

    const writeStream = fs.createWriteStream('./feefo-product-reviews.csv')

    const headRow = [
        'SKU',
        'rating',
        'review count'
    ]

    writeStream.write(`${headRow.join(',')}\n`)

    while (!fetchedAll) {
        const data = await getFeefoProductReviews(page)

        data?.map(product => {
            const line = [
                product.sku,
                product.rating,
                product.review_count
            ]
    
            writeStream.write(`${line.join(',')}\n`)
        })

        if (data.length === PAGE_SIZE) {
            page++

            writeStream.write(`------ PAGE: ${page}\n`)
        }

        fetchedAll = data.length < PAGE_SIZE
    }

    writeStream.end()

    writeStream.on('finish', () => {
        console.log('Success: CSV file generated.')
    })
}

generateCsv()
