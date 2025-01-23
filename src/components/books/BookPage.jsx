import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../shared/LoadingSpinner'
import { useUser } from '../../hooks/useUser'

const BookPage = () => {
  const { bookId } = useParams()
  const [book, setBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
        )
        const data = await response.json()
        setBook(data)
      } catch (error) {
        console.error('Error fetching book details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookDetails()
  }, [bookId])

  if (isLoading) return <LoadingSpinner />
  if (!book) return <div>Book not found</div>

  const { volumeInfo } = book

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Cover Section */}
          <div className="flex-shrink-0">
            <img 
              src={volumeInfo.imageLinks?.thumbnail || '/placeholder-book.png'} 
              alt={volumeInfo.title}
              className="w-48 h-72 object-cover rounded-lg shadow-md"
            />
            {volumeInfo.previewLink && (
              <a 
                href={volumeInfo.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Preview Book
              </a>
            )}
          </div>

          {/* Book Details Section */}
          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">{volumeInfo.title}</h1>
            {volumeInfo.subtitle && (
              <h2 className="text-xl text-gray-600 mb-2">{volumeInfo.subtitle}</h2>
            )}
            <p className="text-lg text-gray-700 mb-4">
              By {volumeInfo.authors?.join(', ')}
            </p>

            {/* Book Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="font-medium">{volumeInfo.publishedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Publisher</p>
                <p className="font-medium">{volumeInfo.publisher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pages</p>
                <p className="font-medium">{volumeInfo.pageCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="font-medium">{volumeInfo.categories?.join(', ')}</p>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-2">About this book</h3>
              <div 
                dangerouslySetInnerHTML={{ __html: volumeInfo.description }}
                className="text-gray-700"
              />
            </div>

            {/* Additional Information */}
            <div className="mt-6 space-y-2">
              {volumeInfo.averageRating && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span>{volumeInfo.averageRating} / 5</span>
                  <span className="text-gray-500">
                    ({volumeInfo.ratingsCount} ratings)
                  </span>
                </div>
              )}
              {volumeInfo.industryIdentifiers?.map((identifier) => (
                <p key={identifier.identifier} className="text-sm text-gray-600">
                  {identifier.type.replace('_', ' ')}: {identifier.identifier}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookPage