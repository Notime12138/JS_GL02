/**
 * ClassName: Room_Using for the parser
 * Version: 1.0
 * Description: Use to create all the classRoom read from .cru file
 */


var RoomClass = function createClassRoom(name) //String num, String bat, int cap, boolean com
{
    this.roomName = name;
    this.seanceList = [];
    this.seanceNum = 0;
}

RoomClass.prototype.createSeance = function(num,type,p,h,f,s)
{
    var seance = function(num,type,p,h,f,s)
    {
        this.seanceNum = num,
        this.classType = type,
        this.person = p,
        this.heure = h,
        this.f_alter = f,
        this.salle = s
    }

    return seance;
}

RoomClass.prototype.addSeance = function(seance)
{
    this.seanceList.push(seance);
    this.seanceNum++;
}

module.exports = RoomClass;