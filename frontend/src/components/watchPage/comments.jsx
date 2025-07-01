import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, MoreVertical, Edit, Trash2, X, Check, Crown, Send } from 'lucide-react';

const Comment = ({ videoId, isAuthenticated, token, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const menuRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  // Handle click outside for menu only
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  if (!videoId) {
    return (
      <div className="w-full p-6">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comment/${videoId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setComments(data.data.commentList);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/comment/new-comment/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ commentText: newComment }),
      });
      
      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setLoading(false);
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    
    try {
      const response = await fetch(`/api/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ commentText: editText }),
      });
      
      if (response.ok) {
        setEditingComment(null);
        setEditText('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/comment/deletecomment/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
    setShowMenu(null);
    setDeleteConfirm(null);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const isVideoOwner = (commentUserId) => {
    return false; // You can pass videoOwnerId as prop to enable this
  };

  const shouldShowReadMore = (text) => {
    const lines = text.split('\n');
    return lines.length > 3 || text.length > 200;
  };

  const getDisplayText = (text, commentId) => {
    const isExpanded = expandedComments.has(commentId);
    
    if (!shouldShowReadMore(text) || isExpanded) {
      return text;
    }
    
    const lines = text.split('\n');
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n');
    }
    
    return text.length > 200 ? text.substring(0, 200) : text;
  };

  const toggleExpanded = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const handleMenuClick = (e, commentId) => {
    e.stopPropagation();
    setShowMenu(showMenu === commentId ? null : commentId);
  };

  return (
    <>
      <div className="w-full p-6 bg-white pb-20">
        {/* Modern Comment Input - Only show if authenticated */}
        {isAuthenticated ? (
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex gap-3">
                <img
                  src={user?.avatar || '/default-avatar.png'}
                  alt="Your avatar"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment..."
                    className="w-full bg-transparent placeholder-gray-500 text-gray-900 resize-none border-none outline-none text-sm leading-relaxed"
                    rows="3"
                  />
                  {newComment.trim() && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {newComment.length} characters
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewComment('')}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleAddComment}
                          disabled={loading}
                          className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                        >
                          {loading ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {loading ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-gray-600 text-sm">Please log in to add a comment</p>
            </div>
          </div>
        )}

        {/* Comments Header */}
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">{comments.length} Comments</span>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="group">
              <div className="flex gap-3">
                <img
                  src={comment.userId?.avatar || '/default-avatar.png'}
                  alt={comment.userId?.userName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      @{comment.userId?.userName}
                    </span>
                    {isVideoOwner(comment.userId?._id) && (
                      <Crown className="w-4 h-4 text-yellow-500" title="Video Owner" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-800 leading-relaxed">
                    <p className="break-words whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
                      {getDisplayText(comment.commentText, comment._id)}
                    </p>
                    
                    {shouldShowReadMore(comment.commentText) && (
                      <button
                        onClick={() => toggleExpanded(comment._id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1 transition-colors"
                      >
                        {expandedComments.has(comment._id) ? 'Show less' : '...more'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Menu for own comments */}
                {isAuthenticated && user?._id === comment.userId?._id && (
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                    <button
                      onClick={(e) => handleMenuClick(e, comment._id)}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {showMenu === comment._id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-32">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingComment(comment._id);
                            setEditText(comment.commentText);
                            setShowMenu(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(comment._id);
                            setShowMenu(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 text-left text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Comment Popup */}
      {editingComment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Comment</h3>
              <button
                onClick={() => {
                  setEditingComment(null);
                  setEditText('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                rows="4"
                placeholder="Edit your comment..."
              />
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setEditingComment(null);
                  setEditText('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditComment(editingComment)}
                disabled={!editText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-sm"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Comment</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteComment(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Comment;