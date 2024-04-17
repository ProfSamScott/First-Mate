/**
 * First Mate - A BattleShip Assistant
 * 
 * Copyright Sam Scott, 2013
 * 
 * sam.scott@sheridanc.on.ca
 * 
 */

window.onload= function () {

	var seaColor = "rgb(96,96,255)";
	var missColor = "rgb(192,192,255)";
	var hitColor = "rgb(255,128,128)";
	var shipColor = "orange";
	var borderColor = "rgb(128,128,255)";
	var predictionColor = "red";

	var UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3;

	var userBoard = [[],[],[],[],[],[],[],[]];
	var userLengths = [];

	var table = document.getElementById("mainTable");
	for (var r=0; r<8; r++) {
		var row = document.createElement("TR");
		table.appendChild(row);
		for (var c=0; c<8; c++) {
			var td = document.createElement("td");
			var cell = document.createElement("input");
			cell.type="button";
			cell.className="cell";
			cell.style["backgroundColor"]="rgb(96,96,255)";
			cell.id=""+(r*10+c);
			cell.onclick=cellListener;
			td.appendChild(cell);
			row.appendChild(td);
			userBoard[r][c]=cell;
		}
	}

	var nextCounter = -1;

	document.getElementById("compute").onmousedown=startCompute;
	document.getElementById("new").onmousedown=init2;
	document.getElementById("right").onmousedown=startNext;
	document.getElementById("left").onmousedown=startPrevious;
	document.getElementById("right").onmouseup=stopNext;
	document.getElementById("left").onmouseup=stopPrevious;
	document.getElementById("delete").onmousedown=deleteOpp;
	document.getElementById("clear").onmousedown=init3;
	document.getElementById("helpbutton").onclick=help;
	document.getElementById("helpbutton2").onclick=help;

	if (localStorage["BattleShipAssistantCurrentName"])
		loadBoard(localStorage["BattleShipAssistantCurrentName"]);
	else {
		localStorage["Example"]="---M--------------*-------------------------------- M   --- SSSS";
		loadBoard("Example");
		alert("Welcome! I have created an example opponent for you. In this example, you have found one boat, and have hit another once. Press compute to see my advice in this case.");
	}

	function init(load) {
		if (load) 
			setName("");
		document.getElementById("name").style["color"]="black";
		document.getElementById("name").disabled=true;

		for (var r=0; r<8; r++) 
			for (var c=0; c<8; c++) {
				userBoard[r][c].symbol="-";
				userBoard[r][c].value=' ';
				userBoard[r][c].style["backgroundColor"] = seaColor;
				if (load) 
					userBoard[r][c].disabled = true;
				else
					userBoard[r][c].disabled = false;
			}
		userLengths[2] = userLengths[3] = userLengths[4] = 2;
		if (load) {
			nextCounter = 0;
			nextOpp();
			nextCounter = -1;
		}
		if (!load)
			saveBoard();
		//computeBoard();
	}

	function init2() {
		var newName = prompt("New Opponent Name?");
		if (newName != "" && newName != null) {
			loadBoard(newName);
			// TTD check for duplicate name here before loading
			init(false);
		}
	}
	function init3() {
		var currentName = document.getElementById("name").value;
		if (currentName == "")
			init(true);
		else 
			if (confirm("Clear the board for "+document.getElementById("name").value+"? Are you sure?")) 
				init(false);
	}
	function startCompute() {
		setTimeout(blackout,1);
		setTimeout(computeBoard,100);
	}
	function blackout() {
		var s = document.getElementById("screen");
		s.style["display"]="block";
		//alert("");
	}
	function unblackout() {
		var s = document.getElementById("screen");
		s.style["display"]="none";		
	}
	function computeBoard() {
		// counter stuff
		// var xmlhttp=new XMLHttpRequest();
		// xmlhttp.onreadystatechange=function()
		// {
		// 	if (xmlhttp.readyState==4 && xmlhttp.status==200)
		// 		document.getElementById("count").innerHTML=xmlhttp.responseText+" Shots Computed";
		// };
		// xmlhttp.open("GET","/counters.php?page=http://www-acad.sheridanc.on.ca/staff/scottsam/BattleShip&firstvisit=",true);
		// xmlhttp.send();
		// end counter stuff
		
		if (userLengths[2]+userLengths[3]+userLengths[4] == 0)
			alert("This game is already over. There are no ships left to find.");
		else {
			//var s = document.getElementById("screen");
			var board = [[],[],[],[],[],[],[],[]];
			for (var r=0; r<8; r++) 
				for (var c=0; c<8; c++) 
					userBoard[r][c].count = 0;
			var NUM_REPS = 10000;
			var rejections = 0;
			var reps;
			var boardok = true;

			for (reps = 0; reps-rejections<NUM_REPS && rejections < NUM_REPS*5; reps++) {
				if (rejections == NUM_REPS && reps == NUM_REPS) {
					alert("This board is not possible. Please review your selections and try again.\n\nTIP: Only use the * symbol for hits. Once a ship is destroyed you must change all its * symbols to S symbols.");
					boardok = false;
					break;
				}
				/*if ((reps-rejections)%100 == 0) {
				s.innerHTML="<br><br><br><br><br><br><br>Thinking: "+Math.round((reps-rejections)/NUM_REPS*100)+"%";
				s.style["display"]="none";
				s.style["display"]="block";
				//alert("");
			}*/
				for (var i=0; i<8; i++)
					for (var j=0; j<8; j++)
						board[i][j] = userBoard[i][j].symbol;

				// S = given ship, <space> = given ship buffer
				// M = given miss
				// * = given hit

				var lengths = [];
				lengths[2] = userLengths[2];
				lengths[3] = userLengths[3];
				lengths[4] = userLengths[4];

				var next = 4;
				var tries = 0;
				do {
					var x,y;
					do {
						x = Math.floor(Math.random()*8);
						y = Math.floor(Math.random()*8);
					} while (userBoard[y][x].symbol !="-" && userBoard[y][x].symbol !="*");
					if (lengths[next] > 0) {
						var dir = Math.floor(Math.random()*4);
						if (placeShip(board,x,y,next,dir))
							lengths[next]--;
						tries++;
					} else
						next--;
				} while (next>1 && tries <1000);

				if (tries < 1000) {
					// check given hits respected
					var good = true;
					for (var r=0; r<8 && good; r++)
						for (var c=0; c<8 && good; c++)
							if (board[r][c] == '*')
								good = false;
					//horizontal ships
					for (var r=0; r<8 && good; r++) {
						var minLength = 1;
						for (var c=0; c<8 && good; c++)
							if (userBoard[r][c].symbol=='*') {
								minLength++;
								if (board[r][c] < minLength) {
									good = false;
									//alert("reject");
								};
							} else
								minLength = 1;
					}
					//vertical ships
					for (var c=0; c<8 && good; c++) {
						var minLength = 1;
						for (var r=0; r<8 && good; r++)
							if (userBoard[r][c].symbol=='*') {
								minLength++;
								if (board[r][c] < minLength) {
									good = false;
									//System.out.println("reject");
								};
							} else
								minLength = 1;
					}						
					if (good) {
						for (var r=0; r<8; r++)
							for (var c=0; c<8; c++)
								if (userBoard[r][c].symbol != " " && userBoard[r][c].symbol != "*" && !isNaN(board[r][c])) {
									userBoard[r][c].count++;
								}
						//printBoard(board);
					} else {
						//System.out.println("reject");
						rejections++;
					};
				} else {
					//printBoard(board);
					//System.out.println();
					rejections++;
				};
			}

			if (boardok) {
				//	counts[0][0]=counts[0][1]=counts[0][2]=counts[0][3]=0;
				var maxr = 0, maxc=0;
				for (var r=0; r<8; r++) {
					for (var c=0; c<8; c++) {
						var perc = Math.round(userBoard[r][c].count/(reps-rejections)*100);
						userBoard[r][c].count=perc;
						//System.out.printf("%3s",perc);
						userBoard[r][c].style["backgroundColor"]=seaColor;
						if (userBoard[r][c].symbol=='-') {
							userBoard[r][c].value=""+perc;
							if (userBoard[r][c].count > userBoard[maxr][maxc].count) {
								maxr = r;
								maxc = c;
							};
						} else if (userBoard[r][c].symbol=='M') {
							userBoard[r][c].style["backgroundColor"]=missColor;
						} else if (userBoard[r][c].symbol=='*') {
							userBoard[r][c].style["backgroundColor"]=hitColor;
						} else if (userBoard[r][c].symbol=='S') {
							userBoard[r][c].style["backgroundColor"]=shipColor;
						} else if (userBoard[r][c].symbol==' ') {
							userBoard[r][c].style["backgroundColor"]=borderColor;
						} 

					};
					//System.out.println();
				}
				//System.out.println("row "+(maxr+1)+", col "+(maxc+1));
				//alert(""+(reps-rejections));
				userBoard[maxr][maxc].style["backgroundColor"] = predictionColor;
				saveBoard();
				//dumpCounts(reps,rejections);
				//System.out.println(tries < 1000);
			} else
				loadBoard(localStorage["BattleShipAssistantCurrentName"]);
		}
			setTimeout(unblackout,20);
	};

	function placeShip(board, x, y, length, dir) {
		//xxx = board
		var top=-10, bottom=-10, left=-10, right=-10;
		switch (dir) {
		case UP:
			top = y - length + 1;
			if (top <0) return false;
			bottom = y;
			left = x;
			right = x;
			break;
		case DOWN:
			bottom = y + length - 1;
			if (bottom >= 8) return false;
			top = y;
			left = x;
			right = x;
			break;	
		case RIGHT:
			right = x + length - 1;
			if (right >= 8) return false;
			bottom = y;
			left = x;
			top = y;
			break;	
		case LEFT:
			left = x - length + 1;
			if (left < 0) return false;
			bottom = y;
			right = x;
			top = y;
			break;		
		}
		// check ship position
		for (var r=top; r<=bottom;r++)
			for (var c=left; c<=right;c++)
				if (board[r][c] != '-' && board[r][c] != '*')
					return false;
		// check ship borders (optimize)
		if (left != 0)
			for (var r=top-1; r<=bottom+1;r++)
				if (r>=0 && r<8 && board[r][left-1] != "-" && board[r][left-1] != " " && board[r][left-1] != "M"&& board[r][left-1] != "b")
					return false;
		if (right != 7)
			for (var r=top-1; r<=bottom+1;r++)
				if (r>=0 && r<8 && board[r][right+1] != "-" && board[r][right+1] != " "&&board[r][right+1] != "M"&&board[r][right+1] != "b")
					return false;
		if (top != 0)
			for (var c=left-1; c<=right+1;c++)
				if (c>=0 && c<8 && board[top-1][c] != "-" && board[top-1][c] != " "&&board[top-1][c] != "M"&&board[top-1][c] != "b")
					return false;
		if (bottom != 7)
			for (var c=left-1; c<=right+1;c++)
				if (c>=0 && c<8 && board[bottom+1][c] != "-" && board[bottom+1][c] != " "&& board[bottom+1][c] != "M"&& board[bottom+1][c] != "b")
					return false;
		// place border (optimize)
		for (var r=top-1; r<=bottom+1;r++)
			for (var c=left-1; c<=right+1;c++)
				if (r>=0 && r<8 && c>=0 && c<8 && board[r][c] != '*')
					board[r][c] = 'b';
		// place ship (optimize)
		for (var r=top; r<=bottom;r++)
			for (var c=left; c<=right;c++)
				board[r][c] = length;
		return true;
	}

	function cellListener(event) {
		//	alert(event.target.id)
		var row=Math.floor(event.target.id/10);
		var col=event.target.id%10;
		var color = "white";

		switch(userBoard[row][col].symbol) {
		case '-':
			userBoard[row][col].symbol = 'M';
			color=missColor;
			break;
		case 'M':
			userBoard[row][col].symbol = '*';
			color=hitColor;
			break;
		case '*':
		case ' ':
			userBoard[row][col].symbol = 'S';
			color=shipColor;
			break;
		case 'S':
			userBoard[row][col].symbol = '-';
			color=seaColor;
			break;

		}
		if (userBoard[row][col].symbol == '-')
			userBoard[row][col].value=" ";
		else 
			userBoard[row][col].value=userBoard[row][col].symbol;
		//alert(""+row+" "+col+" "+;userBoard[row][col]);
		userBoard[row][col].style["backgroundColor"]=color;
		shipBuffers();
		updateCounts();
		saveBoard();
		loadBoard(localStorage["BattleShipAssistantCurrentName"]);
		//computeBoard();
	}

	function updateCounts() {
		var counts = [];
		counts[2]=counts[3]=counts[4]=0;
		var count = 0;
		for (var r=0; r<8; r++) {
			count = 0;
			for (var c=0; c<8; c++)
				if (userBoard[r][c].symbol=='S')
					count++;
				else {
					if (count >= 2 && count <=4)
						counts[count]++;
					//if (count>0)alert(count)
					count = 0;
				}
			if (count >= 2 && count <= 4)
				counts[count]++;
		}

		for (var c=0; c<8; c++) {
			count = 0;
			for (var r=0; r<8; r++)
				if (userBoard[r][c].symbol=='S')
					count++;
				else {
					if (count >= 2 && count <=4)
						counts[count]++;
					count = 0;
				}
			if (count >= 2 && count <= 4)
				counts[count]++;
		}
		for (var i=2; i<=4; i++)
			userLengths[i] = Math.max(0, 2-counts[i]);
//		alert(userLengths[2]+"-"+userLengths[3]+"-"+userLengths[4]);
	}

	function shipBuffers() {
		for (var r = 0; r<8; r++)
			for  (var c = 0; c<8; c++) {
				if (userBoard[r][c].symbol == ' ') {
					userBoard[r][c].symbol = '-';
					userBoard[r][c].value=" ";
					userBoard[r][c].style["backgroundColor"]=seaColor;
				}
				if (userBoard[r][c].symbol == '-') {
					for (var i=r-1;i<=r+1;i++)
						for (var j=c-1;j<=c+1;j++)
							if (i<8 && j<8 && i>=0 && j>=0 && userBoard[i][j].symbol == 'S') {
								userBoard[r][c].symbol = ' ';
								userBoard[r][c].value= " ";
								userBoard[r][c].style["backgroundColor"]=borderColor;
							}
				}
			}
	}

	function sane(key) {
		var legalChars=["-"," ","M","S","*"];
		var data = localStorage[key];
		if (data.length != 64)
			return false;
		for (var i=0; i<64;i++)
			if (legalChars.indexOf(data.charAt(i)) == -1)
				return false;
		return true;
	}
	function sortedKeys() {
		var keys = Object.keys(localStorage).sort(function(a,b){
			if(a.toLowerCase()<b.toLowerCase())
				return -1; 
			else if(a.toLowerCase() > b.toLowerCase()) 
				return 1; 
			else return 0;
		}
		);

		for (var i=0; i<keys.length;i++)
			if (!sane(keys[i])) {
				keys.splice(i,1); 
				i--;
			}
		return keys;
	}

	function nextOpp() {
		if (nextCounter >= 0) {
			var keys = sortedKeys();
			if (keys.length > 0) {
				var currentName = document.getElementById("name").value;
				if (currentName=="") {
					if (keys.length>0)
						loadBoard(keys[0]);
				} else {
					var i = keys.indexOf(currentName);
					i=(i+1)%keys.length;
					loadBoard(keys[i]);
				}
			} else
				setName("");
			if (nextCounter > 0)
				timer=setTimeout(nextOpp,100);
			nextCounter++;
		}
	}

	function previousOpp() {
		if (nextCounter >= 0) {
			var keys = sortedKeys();
			if (keys.length > 0) {
				var currentName = document.getElementById("name").value;
				if (currentName=="") {
					if (keys.length > 0)
						loadBoard(keys[keys.length-1]);
				} else {
					var i = keys.indexOf(currentName);
					i=(i-1);
					if (i<0)
						i = keys.length-1;
					loadBoard(keys[i]);
				}
			} else
				setName("");
			document.getElementById("name").style["color"]="black";
			if (nextCounter > 0)
				timer=setTimeout(previousOpp,100);
			nextCounter++;
		}
	}
	function deleteOpp() {
		var currentName = document.getElementById("name").value;
		if (currentName == "")
			init(true);
		else {
			if (confirm("Delete "+document.getElementById("name").value+"? Are you sure?")) {
				nextCounter = 0;
				nextOpp();
				nextCounter = -1;
				localStorage.removeItem(currentName);
				if (sortedKeys().length == 0) {
					init(true);
				}
				if (localStorage.length == 0)
					init(true);
			}
		}
	}
	function saveBoard() {
		var currentName = document.getElementById("name").value;
		if (currentName != "") {
			var out = "";
			for (var r = 0; r<8; r++)
				for  (var c = 0; c<8; c++)
					out+=userBoard[r][c].symbol;
			localStorage[document.getElementById("name").value] = out;
		}
	}
	function loadBoard(k) {
		setName(k);
		document.getElementById("name").style["color"]="black";
		document.getElementById("name").disabled=true;
		var inp = localStorage[k];
		if (!inp)
			init(false);
		else {
			for (var r = 0; r<8; r++)
				for  (var c = 0; c<8; c++) {
					userBoard[r][c].symbol=inp.charAt(r*8+c);
					if (userBoard[r][c].symbol != "-")
						userBoard[r][c].value=userBoard[r][c].symbol;
					else
						userBoard[r][c].value=" ";
					userBoard[r][c].disabled = false;
					if (userBoard[r][c].symbol == '-')
						userBoard[r][c].style["backgroundColor"]=seaColor;
					else if (userBoard[r][c].symbol == 'M')
						userBoard[r][c].style["backgroundColor"]=missColor;
					else if (userBoard[r][c].symbol == '*')
						userBoard[r][c].style["backgroundColor"]=hitColor;
					else if (userBoard[r][c].symbol == 'S')
						userBoard[r][c].style["backgroundColor"]=shipColor;
					else if (userBoard[r][c].symbol == ' ')
						userBoard[r][c].style["backgroundColor"]=borderColor;
				}
			updateCounts();
		}
	}
	function startNext() {
		nextCounter = 0;
		nextOpp();
		timer=setTimeout(nextOpp,1000);
	}
	function stopNext() {
		//alert("hi")
		nextCounter = -1;
		clearTimeout(timer);
	}
	function startPrevious() {
		nextCounter = 0;
		previousOpp();
		timer=setTimeout(nextOpp,1000);
	}
	function stopPrevious() {
		//alert("hi")
		nextCounter = -1;
		clearTimeout(timer);
	}
	function dumpCounts(reps, rejections) {
		var debug = document.getElementById("debug");
		for (var r = 0; r<8; r++) {
			for  (var c = 0; c<8; c++) {
				debug.innerHTML += userBoard[r][c].count+" ";
			}
			debug.innerHTML+="<br>";
		}
		debug.innerHTML+="reps "+reps+" rejections"+rejections+"<br><br>";
	}
	function setName(name) {
		document.getElementById("name").value = name;
		localStorage["BattleShipAssistantCurrentName"] = name;
	}
	function help() {
		var helpbutton = document.getElementById("helpbutton");
		var helpbutton2 = document.getElementById("helpbutton2");
		var help = document.getElementById("help");
		if (helpbutton.innerHTML=="Show Help") {
			help.style["display"]="block";
			helpbutton.innerHTML="Hide Help";
			helpbutton.href="#help";
			helpbutton2.innerHTML="Hide Help";
			helpbutton2.href="#help";
		} else {
			help.style["display"]="none";
			helpbutton.innerHTML="Show Help";
			helpbutton.href="#top";
			helpbutton2.innerHTML="Show Help";
			helpbutton2.href="#top";
		}
		//return false;
	}

		// counter stuff
		// var xmlhttp=new XMLHttpRequest();
		// xmlhttp.onreadystatechange=function()
		// {
		// 	if (xmlhttp.readyState==4 && xmlhttp.status==200)
		// 		document.getElementById("count").innerHTML=xmlhttp.responseText+" Shots Computed";
		// };
		// xmlhttp.open("GET","/counters.php?page=http://www-acad.sheridanc.on.ca/staff/scottsam/BattleShip",true);
		// xmlhttp.send();
		// end counter stuff

};