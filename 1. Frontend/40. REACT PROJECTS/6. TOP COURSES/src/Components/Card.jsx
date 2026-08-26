import { useState } from 'react';
import { FcLike, FcLikePlaceholder } from 'react-icons/fc';
import { toast } from 'react-toastify';

const Card = (props) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const { course, likedCourses, setLikedCourses } = props;

    function clickHandler() {
        if (likedCourses.includes(course.id)) {
            setLikedCourses((prev) => prev.filter((cid) => cid !== course.id));
            toast.warning("Like Removed");
        } else {
            if (likedCourses.length === 0) {
                setLikedCourses([course.id]);
            } else {
                setLikedCourses((prev) => [...prev, course.id]);
            }
            toast.success("Liked Successfully");
        }
    }

    const toggleDescription = () => {
        setShowFullDescription((prev) => !prev);
    };

    return (
        <div className='bg-bgDark bg-opacity-90 w-[300px] rounded-md overflow-hidden'>
            <div className='relative'>
                <img src={course.image.url} alt="Course Image" />

                <div className='rounded-full w-[40px] h-[40px] bg-white absolute right-2 bottom-[-12px] grid place-items-center'>
                    <button onClick={clickHandler}>
                        {
                            likedCourses.includes(course.id)
                                ? <FcLike fontSize="1.75rem" />
                                : <FcLikePlaceholder fontSize="1.75rem" />
                        }
                    </button>
                </div>
            </div>

            <div className='p-4'>
                <p className='text-white text-lg font-semibold leading-6'>{course.title}</p>

                <p className='mt-2 text-white'>
                    {showFullDescription
                        ? course.description
                        : course.description.length > 100
                            ? course.description.substring(0, 100) + "..."
                            : course.description
                    }

                    {course.description.length > 100 && (
                        <button
                            onClick={toggleDescription}
                            className="text-yellow-400 ml-1 underline"
                        >
                            {showFullDescription ? "Show Less" : "Read More"}
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Card;
