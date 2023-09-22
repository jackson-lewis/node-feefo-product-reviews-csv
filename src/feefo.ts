import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

type FeefoProductReview = {
    rating: number
    sku: string
    review_count: number
}

const PAGE_SIZE = 100

async function getFeefoProductReviews(page: number = 1): Promise<FeefoProductReview[]>  {
    const url = new URL('https://api.feefo.com/api/11/products/ratings')

    url.searchParams.set('merchant_identifier', process.env.FEEFO_MERCHANT_IDENTIFIER)
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
    let totalProductCount: number = 0

    const writeStream = fs.createWriteStream('./.generated/feefo-product-reviews.csv')

    const headRow = [
        'SKU',
        'rating',
        'review count'
    ]

    writeStream.write(`${headRow.join(',')}\n`)

    while (!fetchedAll) {
        const data = await getFeefoProductReviews(page)

        data.map(product => {
            const line = [
                product.sku,
                product.rating,
                product.review_count
            ]
    
            writeStream.write(`${line.join(',')}\n`)
        })

        if (data.length === PAGE_SIZE) {
            page++
        }

        totalProductCount = totalProductCount + data.length
        fetchedAll = data.length < PAGE_SIZE
    }

    writeStream.end()

    writeStream.on('finish', () => {
        console.log(`Success: CSV file generated with ${totalProductCount} products.`)
    })
}

generateCsv()
