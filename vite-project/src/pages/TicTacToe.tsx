import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from "@clerk/react";

const TicTacToe: React.FC = () => {
    const { isLoaded, isSignedIn } = useUser();
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState<boolean>(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [winningLine, setWinningLine] = useState<number[] | null>(null);
    const navigate = useNavigate();

    const calculateWinner = (squares: (string | null)[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        return null;
    };

    const handleClick = (i: number) => {
        if (winner || board[i]) return;

        const newBoard = board.slice();
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);
    };

    useEffect(() => {
        const result = calculateWinner(board);
        if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: result.winner === 'X' ? ['#60A5FA', '#3B82F6'] : ['#F87171', '#EF4444']
            });
        }
    }, [board]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setWinner(null);
        setWinningLine(null);
    };

    const isDraw = !winner && board.every(square => square !== null);

    if (!isLoaded) {
        return <div className="flex justify-center items-center h-screen text-center text-2xl font-bold">Loading...</div>;
    }

    if (!isSignedIn) {
        return <div className="flex justify-center items-center h-screen text-center text-2xl font-bold">Please Sign in to view this page</div>;
    }

    return (
        <div className="min-h-screen font-['Poppins',sans-serif] flex flex-col items-center justify-center p-4 bg-inherit text-white mt-12">
            <div className="w-full max-w-md flex flex-col gap-8">

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Tic Tac Toe
                    </h1>
                    <button
                        onClick={resetGame}
                        className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>
                </div>


                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-2xl text-center transform transition-all duration-300">
                    {winner ? (
                        <div className="animate-bounce">
                            <span className={`text-4xl font-black ${winner === 'X' ? 'text-blue-400' : 'text-red-400'}`}>
                                {winner} Wins!
                            </span>
                        </div>
                    ) : isDraw ? (
                        <span className="text-4xl font-black text-slate-400">Draw!</span>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-xl text-white font-medium">Player</span>
                            <span className={`text-5xl font-black ${xIsNext ? 'text-blue-400' : 'text-red-400'} transition-all duration-300 transform scale-110`}>
                                {xIsNext ? 'X' : 'O'}
                            </span>
                            <span className="text-xl text-white font-medium">'s turn</span>
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-3 gap-3 bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50 shadow-inner">
                    {board.map((square, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`
                                h-28 md:h-32 rounded-2xl flex items-center justify-center text-5xl font-black transition-all duration-300
                                ${!square && !winner ? 'hover:bg-slate-700/50 cursor-pointer active:scale-95' : 'cursor-default'}
                                ${square === 'X' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}
                                ${winningLine?.includes(i) ? 'bg-slate-700 ring-4 ring-slate-500 scale-105 z-10' : 'bg-slate-800/60'}
                            `}
                        >
                            {square && (
                                <span className="animate-[pop_0.3s_ease-out]">
                                    {square}
                                </span>
                            )}
                        </button>
                    ))}
                </div>


                <button
                    onClick={resetGame}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl font-bold text-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg active:scale-[0.98]"
                >
                    New Game
                </button>
            </div>

            <style>{`
                @keyframes pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    70% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default TicTacToe;
