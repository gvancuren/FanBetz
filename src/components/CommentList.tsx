interface Comment {
  id: number;
  content: string;
  createdAt: Date; // ✅ uses actual Date type now
  user: {
    name: string;
    profileImage?: string | null;
  };
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (!comments?.length) return null;

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={comment.user.profileImage || '/default-profile.png'}
              alt={comment.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-sm font-semibold text-yellow-400">
              {comment.user.name}
            </div>
          </div>
          <p className="text-gray-300 text-sm">{comment.content}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
