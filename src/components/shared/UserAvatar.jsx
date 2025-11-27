import React from 'react';

const UserAvatar = ({ user, displayName, size = "md", className = "" }) => {
    const photoURL = user?.photoURL;
    const name = displayName || user?.displayName || "User";
    const initial = name[0]?.toUpperCase() || "?";

    // Size classes
    const sizes = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-24 h-24 text-3xl",
        xl: "w-28 h-28 text-4xl"
    };

    const sizeClass = sizes[size] || sizes.md;

    return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
            {photoURL ? (
                <img
                    src={photoURL}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            <div
                className={`${sizeClass} bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${photoURL ? 'hidden' : 'flex'
                    }`}
            >
                {initial}
            </div>
        </div>
    );
};

export default UserAvatar;