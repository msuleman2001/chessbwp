var board = null;
var game = new Chess();
var $status = $('#status');
var $fen = $('#fen');
var $pgn = $('#pgn');
var base_url = '';
var turn_time_remain = 30;
var turn = 'b';
var turn_timer;
var config = {draggable: true, position: 'start', onDragStart: onDragStart, onDrop: onDrop, onSnapEnd: onSnapEnd};
board = Chessboard('myBoard', config);
updateStatus();
var current_login_id;

function onDragStart (source, piece, position, orientation) 
{
	// do not pick up pieces if the game is over
	if (game.game_over()) return false

	// only pick up pieces for the side to move
	if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) 
	{
		return false
	}
}

function onDrop (source, target) 
{
	// see if the move is legal
	// NOTE: always promote to a queen for example simplicity
	var move = game.move({from: source, to: target, promotion: 'q' });

	// illegal move
	
	if (move === null) return 'snapback'
	if (move.flags.includes('c'))
		listKilledPiece(move);
	updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () 
{
	board.position(game.fen())
}

function updateStatus () 
{
	var status = ''
	var status_code = 0;
	var moveColor = 'White'
	if (game.turn() === 'b') 
	{
		moveColor = 'Black'
	}

	// checkmate?
	if (game.in_checkmate()) 
	{
		status = 'Game over, ' + moveColor + ' is in checkmate.';
		status_code = 1;
	}

	// draw?
	else if (game.in_draw()) 
	{
		status = 'Game over, drawn position';
		status_code = 2;
	}

	// game still on
	else 
	{
		status = moveColor + ' to move'

		// check?
		if (game.in_check()) 
		{
			status += ', ' + moveColor + ' is in check';
		}
	}

	if (status_code == 0)
		changeTurnTimer();
	//$status.html(status);
	//$fen.html(game.fen());
	//$pgn.html(game.pgn());
}



function updateLastSeen(login_id, url)
{
	current_login_id = login_id;
	base_url = url;
	setInterval(updateMe, 5000);
}

function updateMe()
{
	$.ajax
	({
		type: 'GET',
		url: base_url + '/index.php/Player/update_last_seen',
		dataType: 'text',
		data: {data: 'kjl'},
		contentType: false,
		processData: false,
		error: function (res){alert('E:' + res.status);},
		success: function(login_time){showLoginTime(login_time)}
	});
}

function showLoginTime(login_time)
{
	var divLoginTime = document.getElementById('divLoginTime');
	divLoginTime.innerHTML = 'Login On: ' + login_time;
}

function listKilledPiece(move)
{
	var killed_color_pre = 'w';
	var killed_color = 'White'
	
	if (move.color == 'w')
	{
		killed_color_pre = 'b';
		killed_color = 'Black';
	}
	
	var killed_list = document.getElementById('divKilled' + killed_color);
	killed_list.innerHTML += '<img width="20px" src="img/pawns/' + killed_color_pre + move.captured + '.png" />';
}

function changeTurnTimer()
{return;
	if (turn == 'b')
		turn = 'w';
	else
		turn = 'b';
	turn_time_remain = 30;
	document.getElementById('divBlackTimer').innerHTML = turn_time_remain;
	document.getElementById('divWhiteTimer').innerHTML = turn_time_remain;
	
	//clearInterval(turn_timer);
	//turn_timer = setInterval(turnRunning, 1000);
}

function turnRunning() 
{return;
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
