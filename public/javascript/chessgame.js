const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "" ;
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );

                pieceElement.innerHTML = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart" , (e) => {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowIndex, col: squareIndex};
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend" , (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSource);
                    // console.log(sourceSquare);
                    // console.log(targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    }); 
    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
    // console.log(board);
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`, 
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
         promotion : "q",
    };
    // if(target.row == 0 || target.row ==7){
    //     move.promotion = "q";
    // }
    // if (chess.move(move)) {
    //     console.log(`Valid move from ${move.from} to ${move.to}`);
    //     socket.emit("move", move);
    // } else {
    //     console.error("Invalid move:", move);
    // }
    socket.emit("move",move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟", // Black pawn
        r: "♜", // Black rook
        n: "♞", // Black knight
        b: "♝", // Black bishop
        q: "♛", // Black queen
        k: "♚", // Black king
        P: "♙", // White pawn
        R: "♖", // White rook
        N: "♘", // White knight
        B: "♗", // White bishop
        Q: "♕", // White queen
        K: "♔", // White king    
    };
    return (piece.color === "w" ? unicodePieces[piece.type.toUpperCase()] : unicodePieces[piece.type]) || null; 
};

socket.on("playerRole", (role) => {
    console.log(role);
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", ()=> {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

renderBoard();