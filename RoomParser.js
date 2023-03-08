/**
 * ClassName: RoomParser
 * Version: 1.0
 * Description: Use to create all the classRoom and classify them
 */

const { exit } = require('process');
const { getSystemErrorMap } = require('util');
var RoomClass = require('./RoomClass')

//RoomParser
var RoomParser = function(sTokenize,sParsedSymb)
{
    this.parsedRoom = [];
    this.symb = ["+","," , "=","P","H","S","$$"];
    this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
	this.needBody = false;
}


//Parser procedure

//tokenize: transform the data input into a list
RoomParser.prototype.tokenize = function(data)
{
    var separator = /(\r\n|,|=)/
    data = data.split(separator);
    data = data.filter((val,idx) => !val.match(separator));
    return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
RoomParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.listRoom(tData);
}


// Parser operand

RoomParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
RoomParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
    if(curS!=undefined)
    {
        return curS;
    }
}


RoomParser.prototype.nextForExpect = function(input){
	var curS = input[0];
	if(this.showParsedSymbols){
		console.log(curS);
	}
    if(curS!=undefined)
    {
        return curS;
    }
}

// accept : verify if the arg s is part of the language symbols.
RoomParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}



// check : check whether the arg elt is on the head of the list
RoomParser.prototype.check = function(s, input){
    if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
RoomParser.prototype.expect = function(s, input){
	var curS = this.nextForExpect(input);
	if(curS != undefined && s=="+")
	{
		if(matched = curS.match(/[+]/)){
			return true;
		}else{
			return false;
		}
	}
	
	if(s == this.next(input)){
		return true;
	}
	else{
		if(s!="+")
		{
			this.errMsg("symbol "+s+" doesn't match", input);
		}
		return false;
	}
	
}




// Parser rules

// <liste_room> = *(<room>) "$$"
RoomParser.prototype.listRoom = function(input){
	this.room(input);
	//this.expect("$$", input);
}


// <room> = "+" <name> <eol> <body> <eol>
RoomParser.prototype.room = function(input){
	if(this.needBody == true)
	{
		index = this.parsedRoom.length -1;
		this.seanceList(this.parsedRoom[index],input);
		//console.log(this.parsedRoom[0].seanceList[0])
		//console.log(this.parsedRoom)
	}

	if(this.expect("+",input))
	{
		var nm = this.name(input);
		var p = new RoomClass(nm);
		this.parsedRoom.push(p);
		this.seanceList(p,input);
		this.needBody = true;
	}else{
		//console.log(input);
		this.needBody = true;
	}
	

	if(input.length > 0){
		this.room(input);
	}
}


RoomParser.prototype.seanceList = function(room,input){
	var body = this.body(input);
	room.addSeance(body);
	this.needBody = false;
}

// <name> = 1*WCHAR 1*DIGIT
RoomParser.prototype.name = function(input){
	//this.expect("+",input)
	var curS = this.next(input);
	if(curS.slice(0,1) === "+"){
        //console.log("name " + curS.slice(1));
		return curS.slice(1);
	}else{
		this.errMsg("Invalid name", input);
	}
}

// <body> = <seanceList> <eol> <optional>
RoomParser.prototype.body = function(input){
    var seanceNum = this.seanceNum(input);
    var type = this.seanceType(input);
	var capacity = this.capacity(input);
	var time = this.heure(input);
	var f = this.fAlter(input);
	var salle = this.salle(input);

	var seance = {seanceNum, type,capacity,time,f,salle};
	
	return seance;
}


// <seanceNum> = 1*DIGIT
RoomParser.prototype.seanceNum = function(input){
	var curS = this.next(input);
	
	if(matched = curS.match(/[12345]/))
	{
		//console.log("SeanceNum :" + matched[0]);
		//console.log(curS);
		return matched[0];
	}else{
		this.errMsg("Invalid seance num", input);
	}
}

// <seanceNum> =1*WCHAR 1*DIGIT
RoomParser.prototype.seanceType = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/[CDT][1-5]/))
	{
		//console.log("SeanceType: " + matched[0]);
		return matched[0];
	}else{
		this.errMsg("Invalid seance type", input);
	}
}

// <capacity> =1*3DIGIT
RoomParser.prototype.capacity = function(input){
	if(this.expect("P", input)){
		var curS = this.next(input);
		if(matched = curS.match(/[1-9][0-9][0-9]|[1-9][0-9]|[1-9]/))
		{
			//console.log("Capacity: " + matched[0]);
			return matched[0];
		}else{
			this.errMsg("Invalid capacity", input);
		}
	}
}

// <hourline> =1WCHAR 1*2DIGIT ":" 1*2DIGIT "-" 1*2DIGIT ":" 1*2DIGIT
RoomParser.prototype.heure = function(input){
	if(this.expect("H",input)){
		var curS = this.next(input);
		var day = curS.slice(0,2);
		if(curS.slice(1,2)!="E")
		{
			day = curS.slice(0,1);
		}
		var space = curS.slice(2,3);
		var time = curS.slice(2);
		if(space == " ")
		{
			time = curS.slice(3);
		}
		time = time.split("-");
		var timeStart = time[0];
		var timeEnd = time[1];

		return{day,timeStart,timeEnd};
		
	}else{
		this.errMsg("Invalid time",input);
	}
}

// <F_Alter> ="F" 1*2DIGIT
RoomParser.prototype.fAlter = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/F[1-5]|F[A-Z]/)){
		return matched[0];
	}else{
		this.errMsg("Invalid filter alter",input);
	}
}


// <room> =1WCHAR 3DIGIT
RoomParser.prototype.salle = function(input){
	if(this.expect("S",input))
	{
		var curS = this.next(input);
		if(matched = curS.match(/[A-T][01234][0][1-9]|[A-T][0-4][1][0]|EXT[1-4]/))
		{
			var salle = matched[0].split("//");
			return salle[0];
		}
	}else{
		this.errMsg("Invalid salle",input);
	}
}

module.exports = RoomParser;