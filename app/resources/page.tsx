import React from "react";
import { BookCardWithAction } from "@/users/dashboard/BookCardWithAction";

const Resources: React.FC = () => {
  const availableBooks = [
    { id: "1", title: "The Pragmatic Programmer", author: "Andy Hunt", imageUrl: "/logos/cd.jpg", daysAvailable: 14 },
    { id: "2", title: "Clean Code", author: "Robert C. Martin", imageUrl: "/logos/cd.jpg", daysAvailable: 10, type: "premium" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
      {availableBooks.map((book) => (
        <BookCardWithAction
          key={book.id}
          title={book.title}
          author={book.author}
          imageUrl={book.imageUrl}
          daysAvailable={book.daysAvailable}
          type={book.type}
        />
      ))}
    </div>
  );
};

export default Resources;
