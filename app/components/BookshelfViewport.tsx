"use client";

import { useTheme } from "../context/ThemeContext";
import { anchoredSeries, ignitedSeries, standaloneBooks } from "../data/books";
import { useState } from "react";
import EmailModal from "./EmailModal";

export default function BookshelfViewport() {
  const { darkMode } = useTheme();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const anchoredBooks = anchoredSeries;
  const ignitedBooks = ignitedSeries;
  const standaloneBooksList = standaloneBooks;

  const cardBg = darkMode ? "bg-[#0F1318]" : "bg-white";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const coverBg = darkMode ? "bg-[#1A1F2E]" : "bg-gray-100";

  const renderBookGrid = (bookList: any[] | undefined, seriesTitle: string) => {
    if (!bookList || bookList.length === 0) return null;

    return (
      <div className="mb-10">
        <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4 border-l-4 border-[#C9A84C] pl-3`}>
          {seriesTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {bookList.map((book: any, index: number) => (
            <div
              key={index}
              className={`${cardBg} border ${cardBorder} rounded-lg p-3 text-center hover:shadow-lg hover:border-[#C9A84C] transition-all`}
            >
              <img
                src={book.cover}
                alt={book.title}
                className={`w-full aspect-[2/3] object-contain rounded-lg mb-2 ${coverBg} cursor-pointer hover:opacity-80 transition-opacity`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-book.jpg";
                }}
              />
              {book.number && (
                <p className={`text-xs font-medium ${subTextColor}`}>Book {book.number}</p>
              )}
              <p className={`text-xs font-medium ${darkMode ? "text-white" : "text-gray-800"} mb-2 line-clamp-2`}>
                {book.title}
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    if (book.flipbookLink && book.flipbookLink !== "#") {
                      window.open(book.flipbookLink, "_blank");
                    } else {
                      alert(`"${book.title}" preview is coming soon! Stay tuned.`);
                    }
                  }}
                  className="w-full text-xs bg-[#C9A84C] text-[#1A1F2E] py-1.5 rounded hover:bg-[#E8D5A3] transition-colors font-medium"
                >
                  📖 Preview
                </button>
                <button
                  onClick={() => window.open(book.amazonLink, "_blank")}
                  className="w-full text-xs bg-[#0F1318] text-[#C9A84C] border border-[#C9A84C] py-1.5 rounded hover:bg-[#C9A84C] hover:text-[#1A1F2E] transition-colors"
                >
                  🛒 Buy on Amazon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto w-full max-w-7xl mx-auto px-4 py-4">
      <div className="text-center mb-6">
        <h2 className="font-playfair text-3xl text-[#C9A84C]">
          Bookshelf
        </h2>
        <p className={`text-[#E8D5A3] text-sm ${darkMode ? "" : "text-[#B89A3A]"}`}>
          Books and resources for your study
        </p>
      </div>

      {renderBookGrid(anchoredBooks, "⚓ The Anchored Series")}
      {renderBookGrid(ignitedBooks, "🔥 The Ignited Series")}
      {renderBookGrid(standaloneBooksList, "📘 Standalone Books")}

      {/* Support Section */}
      <div className={`${cardBg} border ${cardBorder} rounded-lg p-6 text-center mt-8`}>
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} font-medium mb-2`}>
          📚 Support MANUSTRY
        </p>
        <p className={`text-xs ${subTextColor} mb-3`}>
          Your purchases help keep MANUSTRY free for everyone.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="https://www.amazon.com/author/dennislastimoso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C9A84C] hover:text-[#E8D5A3] text-sm transition"
          >
            Author Page
          </a>
          <span className={subTextColor}>•</span>
          {/* ✅ Updated Email Button with Modal */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="text-[#C9A84C] hover:text-[#E8D5A3] text-sm transition"
          >
            Email Us
          </button>
          <span className={subTextColor}>•</span>
          <span className={`text-xs ${subTextColor} italic`}>
            Thank you for supporting MANUSTRY.
          </span>
        </div>
      </div>

      {/* ✅ Email Modal */}
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)}
        source="bookshelf"
        defaultSubject="Question about MANUSTRY Bookshelf"
        defaultMessage="Hello MANUSTRY team,\n\nI have a question about the books available..."
      />
    </div>
  );
}