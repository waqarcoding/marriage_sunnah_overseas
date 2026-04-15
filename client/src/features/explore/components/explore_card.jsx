import { useNavigate } from "react-router-dom";
import { FaHeart, FaTimes, FaStar } from "react-icons/fa";
import FilterRow from "./filter";

const ExploreCard = ({ profile, onLike, onDislike, onSuperLike }) => {
    const navigate = useNavigate();
    const { name, age, location, image, gender, individual } = profile;

    const handleClick = () => {
        navigate("/profile", { state: { user: profile } });
    };

    const defaultImage =
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800";
    const handleFilterClick = () => {
        console.log("Open filter modal!");
    };
    return (
        <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl  h-[80vh] md:h-[calc(90vh-4rem)] mx-auto rounded-2xl shadow-xl overflow-hidden cursor-pointer group">

            {/* Background Image */}
            <div
                onClick={handleClick}
                className="w-full h-full relative rounded-2xl"
                style={{
                    backgroundImage: `url(${image || defaultImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#ddd",
                }}
            >
                {!image && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-2xl">
                        <span className="text-5xl text-gray-400">
                            {gender === "male" ? "👨" : "👩"}
                        </span>
                    </div>
                )}

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent px-4 py-4 flex flex-col justify-start rounded-2xl">
                    <h2 className="text-white font-bold text-xl truncate">
                        {name}, {age}
                    </h2>
                    {location && (
                        <p className="text-sm text-white truncate">{location}</p>
                    )}
                </div>

                {/* Online Badge */}
                {individual?.is_online && (
                    <span
                        className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-green-500 shadow-md"
                        title="Online"
                    ></span>
                )}

                {/* Verified Badge */}
                {individual?.is_verified && (
                    <span className="absolute top-3 left-3 text-blue-500 text-sm font-bold">
                        ✔
                    </span>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDislike?.(profile);
                        }}
                        className="bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-red-500 hover:scale-110 transition"
                    >
                        <FaTimes size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSuperLike?.(profile);
                        }}
                        className="bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-blue-400 hover:scale-110 transition"
                    >
                        <FaStar size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike?.(profile);
                        }}
                        className="bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-green-500 hover:scale-110 transition"
                    >
                        <FaHeart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExploreCard;