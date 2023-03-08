const fs = require('fs');
const colors = require('colors');
const RoomParser = require('./RoomParser.js');
const RoomClass = require("./RoomClass.js");
const vg = require('vega');
const vegalite = require('vega-lite');
const ics = require('ics')
const cli = require("@caporal/core").default;






cli
    .version('room-parser-cli')
	.version('0.01')
    // check .cru file
    .command('check', 'Check if <file> is a valid .cru file, a temploi temp')
    .argument('<file>', 'The file to check with room parser')
    .option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'UTF-8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
	  
			var analyzer = new RoomParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			if(analyzer.errorCount === 0){
				logger.info("The .cru file is a valid cru file".green);
			}else{
				logger.info("The .cru file contains error".red);
			}
			
			logger.debug(analyzer.parsedRoom);

		});
			
	})

	// readme
	.command('readme', 'Display the README.txt file')
	.action(({args, options, logger}) => {
		fs.readFile("./README.md", 'utf8', function(err, data){
			if(err){
				return logger.warn(err);
			}
			
			logger.info(data);
		});
		
	})

	//SPEC1	find the room associated with a UE
	.command('search', 'Find the rooms associated with a UE')
	.argument('<file>', 'The file to search with room parser')
	.argument('<name>', 'The name of a UE')
	.action(({ args, options, logger }) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new RoomParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			
			var findNumber = 0;
			if (analyzer.errorCount === 0) {
				for(var i=0;i<analyzer.parsedRoom.length;i++)
				{
					if(analyzer.parsedRoom[i].roomName == args.name)
					{
						findNumber++;
						console.log("Class Name: " + args.name);
						for(var j=0;j<analyzer.parsedRoom[i].seanceList.length;j++)
						{
							console.log("Salle using: " + analyzer.parsedRoom[i].seanceList[j].salle);
						}
						return;
					}
				}

			if(findNumber == 0)
			{
				console.log("\nCannot find this course");
			}
			else
			{
				console.log("\nTotal: " + findNumber);
			}
			} else {
				logger.info("The .cru file contains error".red);
			}

		});
	})

	//SPEC2	find when the given room is available
	.command('availabletime', 'find when the given room is available')
	.argument('<file>', 'the file .cru to search')
	.argument('<room>', 'the room to search in class')
	.action(({ args, options, logger }) => {
					
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			analyzer = new RoomParser();
			analyzer.parse(data);
			if (analyzer.errorCount === 0) {
			var findNumber=0;
			for(var i=0;i<analyzer.parsedRoom.length;i++)
			{
				for(var j=0;j<analyzer.parsedRoom[i].seanceList.length;j++)
				{
					var temp = analyzer.parsedRoom[i].seanceList[j];
					if(temp.salle == args.room)
					{
						findNumber ++;
						console.log("UE: " + analyzer.parsedRoom[i].roomName);
						switch(temp.time.day)
						{
							case "L":
								{
									console.log("Time at: Monday");
									break;
								}
							case "M":
								{
									console.log("Time at: Tuesday");
									break;
								}
							case "ME":
								{
									console.log("Time at: Wednesday");
									break;
								}
							case "J":
								{
									console.log("Time at: Thursday");
									break;
								}
							case "V":
								{
									console.log("Time at: Friday");
									break;
								}
							case "S":
								{
									console.log("Time at: Saterday");
									break;
								}
							default:
								{
									break;
								}
						}
						console.log("Time available starts at: " + temp.time.timeStart);
						console.log("Time available ends at: " + temp.time.timeEnd)
					}
				}
			}
			
			if(findNumber == 0)
			{
				console.log("\nCannot find this room");
			}
			else
			{
				console.log("\nTotal: " + findNumber);
			}


			
			} else {
					logger.info("The .cru file contains error".red);
					}
		});
	})

	//SPEC3 Find rooms available in a period of time
	.command('availableroom', 'Displays the rooms available in a given time slot')
	.argument('<file>', 'the file .cru to search')
	.argument('<day>', 'The day of the slot')
	.argument('<start>', 'The start time of the slot(HH:MM)')
	.argument('<end>', 'The end time of the slot(HH:MM)')
	.action(({ args, options, logger }) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			analyzer = new RoomParser();
			analyzer.parse(data);

			var dayRegular = /[LMJVS]|ME/;
			var timeRegular = /[1][0-9]:[0-5][0-9]|[0-9]:[0-5][0-9]/
			if(dayRegular.test(args.day) == false || timeRegular.test(args.start) == false || timeRegular.test(args.end) == false)
			{
				console.log("Invalid arguments for day and time");
				return;
			}
			
			var startH = parseInt((args.start.split(":"))[0]);
			var startM = parseInt((args.start.split(":"))[1]);

			var endH = parseInt((args.end.split(":"))[0]);
			var endM = parseInt((args.end.split(":"))[1]);

			if(startH > endH)
			{
				console.log("Invalid time: time start later then time end");
				return;
			}

			if (analyzer.errorCount === 0) {
			var findNumber=0;
			for(var i=0;i<analyzer.parsedRoom.length;i++)
			{
				for(var j=0;j<analyzer.parsedRoom[i].seanceList.length;j++)
				{
					var temp = analyzer.parsedRoom[i].seanceList[j];
					var tempDay = temp.time.day;
					var tempStartH = parseInt((temp.time.timeStart.split(":"))[0]);
					var tempStartM = parseInt((temp.time.timeStart.split(":"))[1]);

					var tempEndH = parseInt((temp.time.timeEnd.split(":"))[0]);
					var tempEndM = parseInt((temp.time.timeEnd.split(":"))[1]);

					if(tempStartH == startH && tempStartM >= startM && tempEndH == endH && tempEndM <= endM && tempDay == args.day)
					{
						findNumber++;
						console.log("UE: " + analyzer.parsedRoom[i].roomName);
						console.log("Time at: " + tempDay);
						console.log("Time available starts at: " + temp.time.timeStart);
						console.log("Time available ends at: " + temp.time.timeEnd);
						console.log("Room: " + temp.salle);
					}
				
				}
			}
				

			
			if(findNumber == 0)
			{
				console.log("\nCannot find this available time");
			}
			else
			{
				console.log("\nTotal: " + findNumber);
			}
		}


			
			});
		})

	

	//SPEC4	Create a fichier iCalendar  
	.command('iCalendar', 'Find the rooms associated with a UE')
	.argument('<file>', 'the file .cru ')
	.argument('<starttime>', 'Start time(yyyy-mm-dd)')
	.argument('<endtime>', 'End time(yyyy-mm-dd)')
	.action(({ args, options, logger }) => {
		
		//clear the content in ./event.ics
		//fs.writeFile('./event.ics', '', function(){console.log('clear the event.ics')})
		
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new RoomParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			//console.log(analyzer.parsedRoom);

			
			

			if (analyzer.errorCount === 0) {
				

				var startyear=parseInt(args.starttime.split("-")[0]);
				var startmonth=parseInt(args.starttime.split("-")[1]);
				var startday=parseInt(args.starttime.split("-")[2]);
				
				var endyear=parseInt(args.endtime.split("-")[0]);
				var endmonth=parseInt(args.endtime.split("-")[1]);
				var endday=parseInt(args.endtime.split("-")[2]);
				
				var startdate=new Date;
				startdate.setFullYear(startyear,startmonth,startday);
				var enddate=new Date;
				enddate.setFullYear(endyear,endmonth,endday);
				var tempdate=new Date;
				tempdate=startdate;
				var timelist = ['D','L','MA','ME','J','V','S',]
				/*console.log(startdate.toString());
				console.log(enddate.toString());
				console.log(tempdate.toString());
				tempdate.setDate(tempdate.getDate() + 1);
				console.log(tempdate.toString());
				*/

				while (tempdate <= enddate){
					
					var day=timelist[tempdate.getDay()];
					
					
					for(var i=0;i<analyzer.parsedRoom.length;i++)
					{
						for(var j=0;j<analyzer.parsedRoom[i].seanceList.length;j++)
						{
							var temp = analyzer.parsedRoom[i].seanceList[j];
							var tempDay = temp.time.day;
							if(tempDay == day)
							{	
								
								var tempStartH = parseInt((temp.time.timeStart.split(":"))[0]);
								var tempStartM = parseInt((temp.time.timeStart.split(":"))[1]);
								var tempEndH = parseInt((temp.time.timeEnd.split(":"))[0]);
								var duree = tempEndH-tempStartH;
								//console.log(tempStartH);
								tmpyear=tempdate.getFullYear();
								tmpmonth=tempdate.getMonth();
								tmpday=tempdate.getDate();

								const event = {
									
									start: [tmpyear,tmpmonth , tmpday, tempStartH, tempStartM],
									duration: { hours: duree },
									title: analyzer.parsedRoom[i].roomName,
									location: temp.salle,

								  }
								  
								  ics.createEvent(event, (error, value) => {
									if (error) {
									  console.log(error)
									  return
									}
									
									console.log(value)

									fs.writeFile(`./event.ics`,value,{flag:'a',encoding:'utf-8'},function(err){
										if(err){
											console.log("File write failure");
										}

   									 }) 

								})
							}
						}
					}
				tempdate.setDate(tempdate.getDate() + 1);
				}
			}
			else{
				logger.info("The .cru file contains error".red);
			}		
				
			
		});
	})

	//SPEC5 check the quality of the university schedule data (a room can only be used by one course on a same timeslot)
	.command('quality', 'check the quality of the university schedule data')
	.argument('<file>', 'the file .cru ')
	.action(({ args, options, logger }) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}
			var analyzer = new RoomParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			console.log(analyzer.parsedRoom);
			if (analyzer.errorCount === 0) {
				arrsalle=new Array;
				//arr[salle1,salle2,salle3]
				arrtime=new Array;
				//arr[[salle1starttime1,salle1starttime2...],[salle2starttime1,salle2starttime2...],.....]
				var flag=1;
				for(var i=0;i<analyzer.parsedRoom.length;i++)
				{
					
					for(var j=0;j<analyzer.parsedRoom[i].seanceList.length;j++)
					{
						var temp = analyzer.parsedRoom[i].seanceList[j];
						var salle=temp.salle;
						hour= parseInt((temp.time.timeStart.split(":"))[0]);
						if (arrsalle.indexOf(salle) == -1 ){
							arrsalle.push(salle);
							arrtime.push([hour]);
						}
						else{
							let n=parseInt(arrsalle.indexOf(salle));
							arrtime[n].push(hour);
							for (var k=0;k<arrtime[n].length;k++){
								if(arrtime[k]==hour){
									console("Time conflict! Salle"+salle+"at"+hour);
									flag=0;
									break;
								}
							}
							
						}
				
					}
				}
				
				if (flag == 1){
					console.log("All the room are used by one course on a same timeslot");
				}


			} 
			else {
				logger.info("The .cru file contains error".red);
			}

		});
	})





	//SPEC6  Generate a synthetic visualization of the room occupancy rate 
	.command('averageChart', 'The average of the occupancy rate of rooms')
	.alias('avgChart')
	.argument('<file>', 'the file .cru ')
	.action(({ args, options, logger }) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}
			
			var analyzer = new RoomParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			if (analyzer.errorCount === 0) {
				var avg = analyzer.parsedRoom.map(p => {
					var m = 0	
					for(var i=0;i<analyzer.parsedRoom.seanceNum;i++)
					{
						if(p.seanceList[i].length > 0){
							m = p.seanceList[i].reduce((acc, elt) => acc + parseInt(elt), 0) / p.seanceList[i].length;
							p["averageRatings"] = m;
						}
					}
					return p;
				})
				
	

				var avgChart = {
					"data": {
						"values": avg
					},
					"mark": "bar",
					"encoding": {
						"x": {
							"field": "slot", "type": "nominal",
							"axis": { "title": "Slots in a week" }
						},
						"y": {
							"field": "averageRatings", "type": "quantitative",
							"axis": { "title": "Average ratings" }
						}
					}
				}


				const myChart = vegalite.compile(avgChart).spec;
				var runtime = vg.parse(myChart);
				var view = new vg.View(runtime).renderer('svg').run();
				var mySvg = view.toSVG();
				mySvg.then(function (res) {
					fs.writeFileSync("./result.svg", res)
					view.finalize();
					logger.info("%s", JSON.stringify(myChart, null, 2));
					logger.info("Chart output : ./result.svg");
				});
			} else {
				logger.info("The .cru file contains error".red);
			}

		});
	})


	//SPEC6  Rank the capacity of classrooms
	.command('rankCapacity', 'Rank the capacity of classrooms')
	.argument('<file>', 'the file .cru ')
	.action(({ args, options, logger }) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new RoomParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			var classmap = new Map;
			if (analyzer.errorCount === 0) {
				
				for(var i=0;i<analyzer.parsedRoom.length;i++)
				{
					for(var j=0;j<analyzer.parsedRoom[i].seanceList.length;j++)
					{
						var temp = analyzer.parsedRoom[i].seanceList[j];
						var salle=temp.salle;
						var capacity=parseInt(temp.capacity);
						if (classmap.get(salle)==null){
							classmap.set(salle,capacity);

						}
						else{
							if (classmap.get(salle)<capacity){
								classmap.set(salle,capacity);
							}
						}
					}
				}

				arr=[];

				var arrayObj=Array.from(classmap);
				arrayObj.sort(
					function(a,b){return a[1]-b[1]}
				)
				console.log("Rank the capability of the salle from low to high:");
				arrayObj.forEach(a => console.log("the salle "+a[0] +" has "+a[1]+" seats "));;
				arrayObj.forEach(a => {if (a[1]>=40){ arr.pusha[0]} })
				if(arr.length==0){
					console.log("There not exists the salle with more than 40 seats");
				}			
				else{
					console.log("The salle with more than 40 seats:");
					arr.forEach(console.log);
				}
			}
		});
	})








cli.run(process.argv.slice(2));