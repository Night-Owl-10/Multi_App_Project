import React, { useState } from 'react';
import { useUser } from "@clerk/react";

interface WeatherData {
    name: string;
    main: {
        temp: number;
        humidity: number;
    };
    wind: {
        speed: number;
    };
    weather: {
        icon: string;
        description: string;
    }[];
    coord: {
        lat: number;
        lon: number;
    };
}

interface ForecastData {
    dt_txt: string;
    main: {
        temp: number;
        humidity: number;
    };
    wind: {
        speed: number;
    };
    weather: {
        icon: string;
        description: string;
    }[];
}

const API = "3b478fdf40a893287863acd16f92f294";

const Weather: React.FC = () => {
    const { isLoaded, isSignedIn } = useUser();
    const [search, setSearch] = useState("");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [fadeIn, setFadeIn] = useState(false);


    const dayDate = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[dayDate.getDay()];
    const month = dayDate.toLocaleString("default", { month: "long" });
    const date = dayDate.getDate();
    const year = dayDate.getFullYear();
    const currentDateFormatted = `${date} ${month} ${year}`;

    const findLocation = async (name: string) => {
        setFadeIn(false);
        setErrorMsg("");
        setWeatherData(null);
        setForecastData([]);

        try {
            const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API}`;
            const res = await fetch(API_URL);
            const result = await res.json();

            if (result.cod !== 200 && result.cod !== "200") {
                setErrorMsg(result.message || "City not found");
                setFadeIn(true);
                return;
            }

            setWeatherData(result);


            const lat = result.coord.lat;
            const lon = result.coord.lon;
            const ForeCast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}`;
            const forecastRes = await fetch(ForeCast_API);
            const forecastResult = await forecastRes.json();

            const uniqueDays: number[] = [];
            const daysForecast = forecastResult.list.filter((forecast: any) => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueDays.includes(forecastDate)) {
                    uniqueDays.push(forecastDate);
                    return true;
                }
                return false;
            });


            setForecastData(daysForecast.slice(0, 5));

            setTimeout(() => {
                setFadeIn(true);
            }, 700);
        } catch (error) {
            setErrorMsg("An error occurred. Please try again.");
            setFadeIn(true);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim() !== "") {
            findLocation(search.trim());
            setSearch("");
        } else {
            alert("Please Enter City or Country Name");
        }
    };

    if (!isLoaded) {
        return <div className="flex justify-center items-center h-screen text-center text-2xl font-bold">Loading...</div>;
    }

    if (!isSignedIn) {
        return <div className="flex justify-center items-center h-screen text-center text-2xl font-bold">Please Sign in to view this page</div>;
    }

    return (
        <div className="min-h-screen font-['Poppins',sans-serif] flex flex-col items-center justify-center p-0 md:p-4 m-0 overflow-hidden mt-12 md:mt-0">
            <div className="w-full max-w-[1200px] xl:max-w-[1400px] lg:max-w-[1100px] bg-[#222831] text-white md:rounded-[25px] rounded-none h-screen md:h-auto overflow-y-auto md:overflow-visible">

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] lg:grid-cols-[2fr_4fr] xl:grid-cols-[2.5fr_5fr] gap-4 md:p-2 lg:p-4">


                    <div className="md:rounded-[25px] w-full bg-[url('https://i0.wp.com/picjumbo.com/wp-content/uploads/beautiful-mount-fuji-free-photo.jpg?w=2210&quality=70')] bg-center bg-cover relative md:shadow-[0_0_20px_-10px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in lg:hover:scale-[1.02] lg:hover:rotate-y-12 sm:hover:scale-100 min-h-[400px] flex flex-col">
                        <div className="p-8 text-center flex flex-col justify-around md:justify-between h-full bg-black/10 md:rounded-[25px] backdrop-blur-[2px]">
                            <div>
                                <h2 className="text-[2rem] md:text-[1.8rem] lg:text-[2.2rem] xl:text-[2.5rem] font-semibold tracking-wide drop-shadow-md capitalize">{dayName}</h2>
                                <span className="text-lg md:text-base lg:text-lg font-medium tracking-wider drop-shadow-md">{currentDateFormatted}</span>
                            </div>

                            <div className={`transition-opacity duration-500 ease-in mt-4 flex-grow flex flex-col items-center justify-center ${fadeIn || (!weatherData && !errorMsg) ? "opacity-100" : "opacity-0"}`}>
                                {errorMsg ? (
                                    <div className="text-center">
                                        <h2 className="text-5xl font-bold text-red-400 drop-shadow-md mb-2">Error</h2>
                                        <h3 className="text-2xl capitalize text-red-200 drop-shadow-md">{errorMsg}</h3>
                                    </div>
                                ) : weatherData ? (
                                    <div className="text-center mt-4">
                                        <img
                                            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                                            alt={weatherData.weather[0].description}
                                            className="w-[80%] h-[80%] md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-cover mx-auto drop-shadow-2xl"
                                        />
                                        <h3 className="text-[2.5rem] md:text-[1.5rem] lg:text-[2rem] xl:text-[2.2rem] capitalize font-bold drop-shadow-md">
                                            {weatherData.weather[0].description}
                                        </h3>
                                    </div>
                                ) : (
                                    <div className="text-center md:mt-4">
                                        <img
                                            src="https://openweathermap.org/img/wn/10d@4x.png"
                                            alt="Default Weather"
                                            className="w-[80%] h-[70%] md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-cover mx-auto drop-shadow-2xl"
                                        />
                                        <h3 className="text-[2rem] md:text-[1.5rem] lg:text-[2.2rem] xl:text-[2.5rem] capitalize font-bold drop-shadow-md">
                                            Overcast Clouds
                                        </h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="p-6 md:p-4 lg:p-8 w-full flex flex-col md:justify-start lg:justify-center bg-[#222831] md:rounded-[25px]">


                        <form onSubmit={handleSearch} className="mb-6 md:mb-4 lg:mb-8 relative flex w-full">
                            <input
                                type="text"
                                placeholder="Search Location"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-grow w-[80%] outline-none bg-gradient-to-br from-[#72EDF2] to-[#5151E5] border border-[#37474f] text-[#000] rounded-l-[25px] py-3 md:py-2.5 lg:py-4 px-4 md:px-5 lg:px-6 font-inherit text-lg md:text-base lg:text-xl placeholder-gray-800/70 shadow-inner focus:ring-2 focus:ring-[#5b5bf3]"
                            />
                            <button
                                type="submit"
                                className=" bg-transparent px-4 md:px-5 lg:px-6 py-3 md:py-2.5 lg:py-4 text-white font-inherit text-base md:text-sm lg:text-lg font-medium cursor-pointer hover:bg-[#4a4ad8] transition-colors shadow-md border-none outline-none absolute right-0 top-0 bottom-0"
                            >
                                Search
                            </button>
                        </form>


                        <div className="flex flex-col gap-4 md:gap-2.5 text-base md:text-sm lg:text-lg mb-8 md:mb-6 lg:mb-12">
                            {weatherData || errorMsg ? (
                                <>
                                    {weatherData && (
                                        <>
                                            <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                                <p className="font-semibold text-white">NAME</p>
                                                <span className="font-bold text-gray-200">{weatherData.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                                <p className="font-semibold text-white">TEMP</p>
                                                <span className="font-bold text-gray-200">{Math.round(weatherData.main.temp - 275.15)}&deg;C</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                                <p className="font-semibold text-white">HUMIDITY</p>
                                                <span className="font-bold text-gray-200">{weatherData.main.humidity}%</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                                <p className="font-semibold text-white">WIND SPEED</p>
                                                <span className="font-bold text-gray-200">{weatherData.wind.speed} Km/h</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                        <p className="font-semibold text-white">NAME</p>
                                        <span className="font-bold text-gray-200">United Kingdom</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                        <p className="font-semibold text-white">TEMP</p>
                                        <span className="font-bold text-gray-200">23&deg;C</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                        <p className="font-semibold text-white">HUMIDITY</p>
                                        <span className="font-bold text-gray-200">2%</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 md:py-1 border-b border-gray-600/30">
                                        <p className="font-semibold text-white">WIND SPEED</p>
                                        <span className="font-bold text-gray-200">2.92 Km/h</span>
                                    </div>
                                </>
                            )}
                        </div>


                        {(!errorMsg) && (
                            <div className="w-full">
                                <ul className="flex justify-around items-center list-none shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[1rem] p-2 md:p-3 lg:p-4 my-0 w-full overflow-x-auto gap-2 md:gap-1 lg:gap-2">
                                    {forecastData.length > 0 ? (
                                        forecastData.map((forecast, idx) => {
                                            const day = new Date(forecast.dt_txt);
                                            const joinDay = days[day.getDay()].substring(0, 3);

                                            return (
                                                <li
                                                    key={idx}
                                                    className="flex min-w-[75px] md:min-w-[72px] lg:min-w-[85px] p-2 md:p-1.5 lg:p-3 flex-col items-center rounded-[1rem] transition-all duration-300 ease-in hover:scale-110 hover:bg-gradient-to-br hover:from-[#72EDF2] hover:to-[#5151E5] hover:text-[#0e1111] hover:shadow-[0_5px_15px_rgba(28,106,230,0.616)] cursor-pointer group flex-shrink-0"
                                                >
                                                    <img
                                                        src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                                                        alt={forecast.weather[0].description}
                                                        className="w-[50%] lg:w-16 lg:h-16 object-cover"
                                                    />
                                                    <span className="font-normal text-base md:text-sm lg:text-lg mt-1">{joinDay}</span>
                                                    <span className="font-medium text-lg md:text-base lg:text-xl my-1">
                                                        {Math.round(forecast.main.temp - 275.15)}&deg;C
                                                    </span>
                                                    <span className="text-xs md:text-[10px] lg:text-sm font-medium text-gray-300 group-hover:text-gray-800">
                                                        {forecast.main.humidity}%
                                                    </span>
                                                    <span className="text-[10px] md:text-[9px] lg:text-xs font-medium text-gray-300 group-hover:text-gray-800 mt-1 whitespace-nowrap">
                                                        {forecast.wind.speed} km/h
                                                    </span>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        [...Array(5)].map((_, idx) => (
                                            <li
                                                key={idx}
                                                className="flex min-w-[75px] md:min-w-[72px] lg:min-w-[85px] p-2 md:p-1.5 lg:p-3 flex-col items-center rounded-[1rem] transition-all duration-300 ease-in hover:scale-110 hover:bg-gradient-to-br hover:from-[#72EDF2] hover:to-[#5151E5] hover:text-[#0e1111] hover:shadow-[0_5px_15px_rgba(28,106,230,0.616)] cursor-pointer group flex-shrink-0"
                                            >
                                                <img
                                                    src="https://openweathermap.org/img/wn/10d@2x.png"
                                                    alt="placeholder"
                                                    className="w-[50%] lg:w-16 lg:h-16 object-cover"
                                                />
                                                <span className="font-normal text-base md:text-sm lg:text-lg mt-1">Sat</span>
                                                <span className="font-medium text-lg md:text-base lg:text-xl my-1">23&deg;C</span>
                                                <span className="text-xs md:text-[10px] lg:text-sm font-medium text-gray-300 group-hover:text-gray-800">79%</span>
                                                <span className="text-[10px] md:text-[9px] lg:text-xs font-medium text-gray-300 group-hover:text-gray-800 mt-1 whitespace-nowrap">15.51 km/h</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Weather;
