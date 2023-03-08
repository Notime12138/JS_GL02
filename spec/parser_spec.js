const RoomClass = require('../RoomClass.js');
const RoomParser = require('../RoomParser.js');

describe("Jasmin test of Parser RoomParser",function () {
    
    beforeAll(function () {
        
        this.analyzer = new RoomParser();

        this.roomclass = new RoomClass("LO02");
    });


    it("can create a roomClass by name input", function () {
        let input = "AP03";
        this.roomclass = new RoomClass(input);
        //this.analyzer.parse(input);
        expect(this.roomclass.roomName).toBe(input);
    });

    

    it("can add seance into the roomClass", function () {
        var seance = this.roomclass.createSeance(1,"D1",25,"V 9:00-12:00","F1","B103");
        this.roomclass.addSeance(seance);

        expect(this.roomclass.seanceList.length).toBe(1);
    });


    it("can parse an entire class from a simulated input", function(){
		
		let input = "+AP03\r\n1,D1,P=25,H=V 9:00-12:00,F1,S=B103//"
		let data = this.analyzer.parse(input);
		
		expect(this.analyzer.parsedRoom.length).toBe(1);
	});

});