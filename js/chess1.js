
var output = document.getElementById('output');//this temprary to show output
var output1 = document.getElementById('output1');
var output2 = document.getElementById('output2');

var piece_locations = {"bp1": [1, 0], "bp2": [1, 1], "bp3": [1, 2], "bp4": [1, 3], "bp5": [1, 4], "bp6": [1, 5], "bp7": [1, 6], "bp8": [1, 7],
					   "br1": [0, 0], "bn1": [0, 1], "bb1": [0, 2], "bk": [0, 3], "bq": [0, 4], "bb2": [0, 5], "bn2": [0, 6], "br2": [0, 7],
					   "wp1": [6, 0], "wp2": [6, 1], "wp3": [6, 2], "wp4": [6, 3], "wp5": [6, 4], "wp6": [6, 5], "wp7": [6, 6], "wp8": [6, 7],
					   "wr1": [7, 0], "wn1": [7, 1], "wb1": [7, 2], "wq": [7, 3], "wk": [7, 4], "wb2": [7, 5], "wn2": [7, 6], "wr2": [7, 7]};
					
var allowed_cells = {"bp1": [[2, 0], [3, 0]],
                      "bp2": [[2, 1], [3, 1]],
					  "bp3": [[2, 2], [3, 2]],
					  "bp4": [[2, 3], [3, 3]],
					  "bp5": [[2, 4], [3, 4]],
					  "bp6": [[2, 5], [3, 5]],
					  "bp7": [[2, 6], [3, 6]],
					  "bp8": [[2, 7], [3, 7]],
					  "br1": null,
					  "bn1": [[2, 0], [2, 2]],
					  "bb1": null,
					  "bk": null,
					  "bq": null,
					  "bb2": null,
					  "bn2": [[2, 5], [2, 7]],
					  "br2": null,
					  "wp1": [[5, 0], [4, 0]],
					  "wp2": [[5, 1], [4, 1]],
					  "wp3": [[5, 2], [4, 2]],
					  "wp4": [[5, 3], [4, 3]],
					  "wp5": [[5, 4], [4, 4]],
					  "wp6": [[5, 5], [4, 5]],
					  "wp7": [[5, 6], [4, 6]],
					  "wp8": [[5, 7], [4, 7]],
					  "wr1": null,
					  "wn1": [[5, 0], [5, 2]],
					  "wb1": null,
					  "wk": null,
					  "wq": null,
					  "wb2": null,
					  "wn2": [[5, 5], [5, 7]],
					  "wr2": null
					 };

var turn = 'b';
var game_type = document.getElementById('hidGameType').value;
var turn_time_remain = 30;
var turn_timer;
var killed_piece_id = '';
var current_row = -1;
var current_col = -1;
var selected_piece_type = '';
var selected_piece_id = '';
var is_check = false;
var king_in_check = '';
var check_piece = '';
var killed_index_black = 0;
var killed_index_white = 0;
var hightlighted_cells = [];
var hidBaseURL = document.getElementById('hidBaseURL');
changeTurnTimer();
//this is initial setup for chessboard
var chess_board = [
	['br1', 'bn1', 'bb1', 'bk', 'bq', 'bb2', 'bn2', 'br2'],
	['bp1', 'bp2', 'bp3', 'bp4', 'bp5', 'bp6', 'bp7', 'bp8'],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['wp1', 'wp2', 'wp3', 'wp4', 'wp5', 'wp6', 'wp7', 'wp8'],
	['wr1', 'wn1', 'wb1', 'wq', 'wk', 'wb2', 'wn2', 'wr2'],
];

var tblChessboard = document.getElementById('tblChessboard');

//this function will run after timer end
function startGame(base_url)
{
	setBoardColor('#8B4513');
}

//this function will setup the color of board
function setBoardColor(color)
{
	for(var row= 0; row < 8; row++)
		for(var col = 0; col < 8; col++)
			if ((row + col) % 2 == 0)
				tblChessboard.rows[row].cells[col].style.backgroundColor = color;
}

function allowDrop(ev) 
{
	ev.preventDefault();
}

function drag(ev) 
{
	if (ev.target.id.startsWith(turn))
	{
		
		current_row = ev.target.parentElement.id[1];
		current_col = ev.target.parentElement.id[2];
		selected_piece_id = ev.target.id;
		hightlightAllowedCells();
	}
	else
		alert('its not your turn');
}

function drop(ev) 
{
	var cell_id = '';
	if (!ev.target.id.startsWith('c'))
		cell_id = ev.target.parentElement.id;
	else
		cell_id = ev.target.id;
	
	perform_move(cell_id);
	if (game_type == 1)
	{
		selected_piece_id = selectPiece(piece_locations, 'b');
		current_row = piece_locations[selected_piece_id][0];
		current_col = piece_locations[selected_piece_id][1];
		cell_id = systemTurn(selected_piece_id);
		perform_move(cell_id);
		
	}
}

function perform_move(cell_id)
{
	var king_id = '';
	
	if (selected_piece_id.startsWith('b'))
		king_id = 'bk';
	else
		king_id = 'wk';
	
	var to_drop_row = parseInt(cell_id[1]);
	var to_drop_col = parseInt(cell_id[2]);
	
	var is_allowed = isInAllowedCells(to_drop_row, to_drop_col);
	
	if (!is_allowed)
		return;
	
	var chess_board_copy = JSON.parse(JSON.stringify(chess_board));
	var allowed_cells_copy = JSON.parse(JSON.stringify(allowed_cells));
	var piece_locations_copy = JSON.parse(JSON.stringify(piece_locations));
	
	var target_piece_id = getPieceInCell(to_drop_row, to_drop_col);
	killed_piece_id = '';
	
	if (target_piece_id != '')
		if (areEnemies(selected_piece_id, target_piece_id))
			killed_piece_id = target_piece_id;
	
	updateChessboard(to_drop_row, to_drop_col);
	piece_locations[selected_piece_id][0] = to_drop_row;
	piece_locations[selected_piece_id][1] = to_drop_col;
	
	for (var piece in allowed_cells)
		if (piece != '')
			if (piece == selected_piece_id)
				generateAllowedCells(selected_piece_id, to_drop_row, to_drop_col);
			else
				generateAllowedCells(piece, piece_locations[piece][0], piece_locations[piece][1]);
	
	if (isCheck(king_id))
	{			
		if (!isCheckRemoved(king_id, killed_piece_id))
		{
			allowed_cells = JSON.parse(JSON.stringify(allowed_cells_copy));
			chess_board = JSON.parse(JSON.stringify(chess_board_copy));
			piece_locations = JSON.parse(JSON.stringify(piece_locations_copy));
			alert('King in Check');
			return;
		}
	}
	
	if (killed_piece_id != '')
	{
		delete piece_locations[killed_piece_id];
		delete allowed_cells[killed_piece_id];
	}
	
	if (king_id == 'wk')//selecting enemy king
		king_id = 'bk';
	else
		king_id = 'wk';
	
	
	for (highlighted_cell in hightlighted_cells)
		hightlighted_cells[highlighted_cell].style.backgroundImage = 'none';
	updateKilledPieceTable();
	killed_piece_id = '';
	renderChessboard();
	
	if (isCheck(king_id))//checking for enemy king
	{
		if (isCheckMate())
			$("#WinGame").modal();
	}
	
	changeTurnTimer();
}

function getIndexOfLocation(piece_id)
{
	var i = -1;
	for (piece in piece_locations) 
	{
		i++
		if (piece == piece_id)
			return i;
	}
		
	return -1;	
}

function getPieceType(piece_id)
{
	if (piece_id.startsWith('bp'))
		return 'blackpawn';
	if (piece_id.startsWith('wp'))
		return 'whitepawn';
	if (piece_id[1] == 'r')
		return 'rock';
	if (piece_id[1] == 'n')
		return 'knight';
	if (piece_id[1] == 'b')
		return 'bishop';
	if (piece_id[1] == 'q')
		return 'queen';
	if (piece_id[1] == 'k')
		return 'king';
}

function generateAllowedCells(piece_id, current_row, current_col)
{
	var new_row = 0;
	var new_col = 0;
	
	selected_piece_type = getPieceType(piece_id);
	
	//for pawn moves
	if (selected_piece_type.endsWith('pawn'))
	{
		allowed_cells[piece_id] = [];
		var addition_factor = 0;
		if (selected_piece_type.startsWith('black'))
			addition_factor = 1;
		else
			addition_factor = -1;
		
		//normal step
		if (chess_board[current_row + addition_factor][current_col] == '')
		{
			new_row = current_row + addition_factor;
			new_col = current_col;
			
			if (chess_board[new_row][new_col] == '')
				allowed_cells[piece_id].push([new_row, new_col]);
		}
		
		//first step. it may be 2 steps
		if (current_row == 1 || current_row == 6)
		{	
			new_row = current_row + addition_factor + addition_factor;
			new_col = current_col;
			if (chess_board[new_row][new_col] == '')
				allowed_cells[piece_id].push([new_row, new_col]);
		}
		
		//checking right column
		if (current_col != 7)
		{
			var right_cross_piece = getPieceInCell(current_row + addition_factor, current_col + 1);
			
			if (right_cross_piece != '')
				if (areEnemies(right_cross_piece, piece_id))
				{		
					new_row = current_row + addition_factor;
					new_col = current_col + 1;
					allowed_cells[piece_id].push([new_row, new_col]);
				}	
		}	
		
		//checking left column
		if (current_col != 0)
		{
			var left_cross_piece = getPieceInCell(current_row + addition_factor, current_col - 1);
			
			if (left_cross_piece != '')
				if (areEnemies(left_cross_piece, piece_id))
				{
					new_row = current_row + addition_factor;
					new_col = current_col - 1;
					allowed_cells[piece_id].push([new_row, new_col]);
				}
		}
		
	}
	
	//king moves
	if (selected_piece_type == 'king')
	{
		allowed_cells[piece_id] = [];
		findAndPushCell(piece_id, current_row + 1, current_col + 1);
		findAndPushCell(piece_id, current_row + 1, current_col);
		findAndPushCell(piece_id, current_row + 1, current_col - 1);
		findAndPushCell(piece_id, current_row, current_col - 1);
		findAndPushCell(piece_id, current_row - 1, current_col - 1);
		findAndPushCell(piece_id, current_row - 1, current_col);
		findAndPushCell(piece_id, current_row - 1, current_col + 1);
		findAndPushCell(piece_id, current_row, current_col + 1);
		allowed_cells[piece_id].push([current_row, current_col]);
	}
	
	if (selected_piece_type == 'knight')
	{
		allowed_cells[piece_id] = [];
		findAndPushCell(piece_id, current_row + 1, current_col + 2);
		findAndPushCell(piece_id, current_row - 1, current_col + 2);
		findAndPushCell(piece_id, current_row + 2, current_col + 1);
		findAndPushCell(piece_id, current_row + 2, current_col - 1);
		findAndPushCell(piece_id, current_row + 1, current_col - 2);
		findAndPushCell(piece_id, current_row - 1, current_col - 2);
		findAndPushCell(piece_id, current_row - 2, current_col + 1);
		findAndPushCell(piece_id, current_row - 2, current_col - 1);
		allowed_cells[piece_id].push([current_row, current_col]);
	}
	
	if (selected_piece_type == 'rock')
	{
		allowed_cells[piece_id] = [];
		for (var row = current_row + 1; row < 8; row++)
		{
			var new_cell = findAndPushCell(piece_id, row, current_col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		for (var row = current_row - 1; row >= 0; row--)
		{
			var new_cell = findAndPushCell(piece_id, row, current_col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		for (var col = current_col + 1; col < 8; col++)
		{
			var new_cell = findAndPushCell(piece_id, current_row, col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		for (var col = current_col - 1; col >= 0; col--)
		{
			var new_cell = findAndPushCell(piece_id, current_row, col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		allowed_cells[piece_id].push([current_row, current_col]);
	}
	
	if (selected_piece_type == 'bishop')
	{
		allowed_cells[piece_id] = [];
		var new_row = current_row + 1;
		var new_col = current_col + 1;
				
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row++, new_col++);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		new_row = current_row + 1;
		new_col = current_col - 1;
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row++, new_col--);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		new_row = current_row - 1;
		new_col = current_col - 1;
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row--, new_col--);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		new_row = current_row - 1;
		new_col = current_col + 1;
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row--, new_col++);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		allowed_cells[piece_id].push([current_row, current_col]);
	}
	
	if (selected_piece_type == 'queen')
	{
		allowed_cells[piece_id] = [];
		for (var row = current_row + 1; row < 8; row++)
		{
			var new_cell = findAndPushCell(piece_id, row, current_col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		for (var row = current_row - 1; row >= 0; row--)
		{
			var new_cell = findAndPushCell(piece_id, row, current_col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		for (var col = current_col + 1; col < 8; col++)
		{
			var new_cell = findAndPushCell(piece_id, current_row, col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		for (var col = current_col - 1; col >= 0; col--)
		{
			var new_cell = findAndPushCell(piece_id, current_row, col);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		var new_row = current_row + 1;
		var new_col = current_col + 1;
				
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row++, new_col++);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		new_row = current_row + 1;
		new_col = current_col - 1;
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row++, new_col--);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		new_row = current_row - 1;
		new_col = current_col - 1;
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row--, new_col--);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		new_row = current_row - 1;
		new_col = current_col + 1;
		for(var i = 0; i < 8; i++)
		{
			var new_cell = findAndPushCell(piece_id, new_row--, new_col++);
			if (new_cell == 'out' || new_cell != 'empty')
				break;
		}
		
		allowed_cells[piece_id].push([current_row, current_col]);
	}
}

function isInBound(row, col)
{
	if (row < 0 || row > 7)
		return false;
	if (col < 0 || col > 7)
		return false;
	return true;
}

function findAndPushCell(piece_id, row, col)
{
	if (isInBound(row, col))
	{	
		var next_cell = getPieceInCell(row, col);
		var are_enemies = areEnemies(next_cell, piece_id);
		
		if (next_cell == '' || are_enemies)
			allowed_cells[piece_id].push([row, col]);
		
		if (next_cell == '')
			return 'empty';
		if (are_enemies)
			return 'enemy';
		else
			return 'friend';
	}
	else
		return 'out';
}

function getPieceInCell(row, col)
{
	return chess_board[row][col];
}

function areEnemies(piece_a, piece_b)
{
	if (piece_a == '' || piece_b == '')
		false;
	if (piece_a[0] == piece_b[0])
		return false;
	else		
		return true;
}

function isInAllowedCells(to_drop_row, to_drop_col)
{
	for (var i = 0; i < allowed_cells[selected_piece_id].length; i++)
		if (allowed_cells[selected_piece_id][i][0] == to_drop_row && allowed_cells[selected_piece_id][i][1] == to_drop_col)
			return true;
	
	return false;	
}

function updateKilledPieceTable()
{
	var divKilled;
	if (killed_piece_id != '')
	{
		if (killed_piece_id.startsWith('b'))
			divKilled = document.getElementById('divKilledBlack');
		else
			divKilled = document.getElementById('divKilledWhite');
		
		divKilled.innerHTML += generatePieceHTMLImageTag(killed_piece_id);
	}
}

function updateChessboard(drop_row, drop_col)
{
	chess_board[current_row][current_col] = '';
	
	if (chess_board[drop_row][drop_col] != '')
		killed_piece_id = chess_board[drop_row][drop_col];
	
	chess_board[drop_row][drop_col] = selected_piece_id;
}

function renderChessboard()
{
	for (var row = 0; row < 8; row++)
		for (var col = 0; col < 8; col++)
			tblChessboard.rows[row].cells[col].innerHTML = generatePieceHTMLImageTag(chess_board[row][col]);
}

function getEnemyKingLocation()
{
	if (selected_piece_id.startsWith('b'))
		alert(white_pieces.wk);
	else
		alert(black_pieces.bk);
}

function isCheck(king_id)
{
	var king_location = piece_locations[king_id];
	for(piece_id in allowed_cells)
		if (piece_id[0] == king_id[0])
			continue;
		else			
			for (move in allowed_cells[piece_id])
				if (allowed_cells[piece_id][move][0] == king_location[0] && allowed_cells[piece_id][move][1] == king_location[1])
				{
					king_in_check = king_id;
					check_piece = piece_id;
					is_check = true;
					return true;
				}
	
	is_check = false;
	king_in_check = '';
	check_piece = '';
	return false;
}

function isCheckRemoved(king_id, killed_piece_id)
{
	if (killed_piece_id == check_piece)
	{
		check_piece = '';
		king_in_check = '';
		is_check = false;
		return true;
	}
	isCheck(king_id);
	return (!is_check);
}

function isCheckMate()
{	
	var in_check = false;
	
	//if check piece is able to killed by some piece
	for (piece_id in allowed_cells)
		if (piece_id[0] != selected_piece_id[0])
			for (move in allowed_cells[piece_id])
				if (allowed_cells[piece_id][move][0] == piece_locations[selected_piece_id][0] && allowed_cells[piece_id][move][1] == piece_locations[selected_piece_id][1])
					return false;
		
	//if king in check may move to some secure location
	for(king_move in allowed_cells[king_in_check])
		for (piece_id in allowed_cells)
			if (piece_id[0] != king_in_check[0])
				for (piece_move in allowed_cells[piece_id])
					if (allowed_cells[piece_id][piece_move][0] == allowed_cells[king_in_check][king_move][0] && allowed_cells[piece_id][piece_move][1] == allowed_cells[king_in_check][king_move][1])
						in_check = true;
				
	//if some other piece sacrifice to secure the king
	if (!selected_piece_id[1] != 'n')
	{
		var check_cells = [];
		var row_add = 0;
		var col_add = 0;
		var row_diff = piece_locations[king_in_check][0] - piece_locations[selected_piece_id][0];
		var col_diff = piece_locations[king_in_check][1] - piece_locations[selected_piece_id][1];
		
		if (row_diff != 0)
			row_add = Math.abs(row_diff) / row_diff;
		if (col_diff != 0)
			col_add = Math.abs(col_diff) / col_diff;
		
		var row_inc = piece_locations[selected_piece_id][0];
		var col_inc = piece_locations[selected_piece_id][1];
		
		while(row_inc != piece_locations[king_in_check][0] && col_inc != piece_locations[king_in_check][1])
		{
			check_cells.push([row_inc, col_inc]);
			row_inc = row_inc + row_add;
			col_inc = col_inc + col_add;
		}
		
		for (piece_id in allowed_cells)
			if (piece_id[0] == king_in_check[0])
				for (move in allowed_cells[piece_id])
					for (var i = 0; i < check_cells.length; i++)
						if (piece_id != king_in_check)
							if (allowed_cells[piece_id][move][0] == check_cells[i][0] && allowed_cells[piece_id][move][1] == check_cells[i][1])
								return false;
	}


	return in_check;
}

function changeTurnTimer()
{
	if (turn == 'b')
		turn = 'w';
	else
		turn = 'b';
	turn_time_remain = 30;
	document.getElementById('divBlackTimer').innerHTML = turn_time_remain;
	document.getElementById('divWhiteTimer').innerHTML = turn_time_remain;
	
	clearInterval(turn_timer);
	turn_timer = setInterval(turnRunning, 1000);
}

function turnRunning() 
{
	var divTimer;
	if (turn == 'b')
		divTimer = document.getElementById('divBlackTimer');
	else
		divTimer = document.getElementById('divWhiteTimer');
	
	turn_time_remain--;
	divTimer.innerHTML = turn_time_remain;	
	if (turn_time_remain <= 0)
	{
		divTimer.innerHTML = 30;
		changeTurnTimer();
	}
		
}

function generatePieceHTMLImageTag(piece_id)
{	
	if (piece_id == '')
		return '';
	var img_str = '<img id="piece_id" height="30" draggable="true" style="z-index: 100" ondragstart="drag(event)" src="base_url/assets/img/pawns/piece_img.png">';
	
	img_str = img_str.replace('base_url', hidBaseURL.value);
	img_str = img_str.replace('piece_id', piece_id);
	var piece_img = piece_id.substring(0,2);
	img_str = img_str.replace('piece_img', piece_img);
	
	return img_str;
}

function hightlightAllowedCells()
{
	hightlighted_cells = [];
	for (allowed_cell in allowed_cells[selected_piece_id])
	{	
		var table_cell = document.getElementById('c' + allowed_cells[selected_piece_id][allowed_cell][0] + allowed_cells[selected_piece_id][allowed_cell][1]);
		
		table_cell.style.backgroundImage = 'url("' + hidBaseURL.value + '/assets/img/allowed-cell-bg.png")';
		table_cell.style.backgroundSize = 'cover';
		hightlighted_cells.push(table_cell);
	}
}

function printChessboard(chessboard1)
{
	output.innerHTML = '';
	
	for (var i = 0; i < 8; i++)
	{
		for (var j = 0; j < 8; j++)
			output.innerHTML += chessboard1[i][j] + "---";
	
		output.innerHTML += '<br />';
	}
}
