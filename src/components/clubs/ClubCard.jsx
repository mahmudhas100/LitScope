
const ClubCard = ({ club }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden border border-stone-100">
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={club.image} 
            alt={club.name}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-ink font-serif">{club.name}</h3>
          <p className="mt-2 text-ink/70 line-clamp-2 text-sm">{club.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-ink/50 font-medium">
              {club.memberCount} members
            </span>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-150 transform hover:scale-105 font-medium shadow-sm">
              Join Club
            </button>
          </div>
        </div>
      </div>
    );
  };
export default ClubCard;