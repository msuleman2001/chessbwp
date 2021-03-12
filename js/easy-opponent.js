function selectPiece(piece_locations, color)
{
	for (piece_id in piece_locations)
	{
		if (piece_id.startsWith(color))
			return piece_id;
	}

		
}

function systemTurn(piece_id)
{
	var cell_id = '';
	var row = -1;
	var col = -1;
	for(piece_id in allowed_cells)
	{
		if (allowed_cells[piece_id].length > 0)
		{
			row = allowed_cells[piece_id][0][0];
			col = allowed_cells[piece_id][0][1];
			break;
		}
	}
	cell_id = 'c' + row + col;
	return cell_id;
			
}