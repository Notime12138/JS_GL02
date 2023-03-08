# ICalendar

​	Ce projet vise principalement à proposer aux utilisateurs un programme permettant de planifier les salles de classe. Les utilisateurs peuvent rechercher des salles pour un cours et connaître la capacité maximale d'une salle. Il est également possible de vérifier quelles chambres sont disponibles pour une période donnée de la semaine. 
​	Ce document qui propose des idées de conception et des exigences côté système, est destiné aux Développeurs, services de support et tous les autres rôles impliqués dans la mise en œuvre et la maintenance des projets logiciels. Il fournira la spécification générale de conception pour le logiciel et la spécification détaillée des exigences. Grâce auquel on peut définir les exigences et déterminer les critères de conception et créer une vue d'ensemble du futur logiciel.  

## How to use

### Installation

* npm install
### Utilisation

node roomParserCli.js <commande>  <file> [-autre paramatre]

* Check if <file> is a valid .cru file, a temploi temp

  node roomParserCli.js check <file>

  -s log the analyzed symbol at each step

  -t log the tokenization results

* Display the README.md file

  node roomParseCli.js readme

* find the room associated with a UE :

  node roomParserCli.js search <file> <name_UE>
* find when the given room is available :

  node roomParserCli.js availabletime <file> <room>
* Displays the rooms available in a given time slot :

  node roomParserCli.js availableroom <file> <day> <start> <end>

* Create the file iCalendar :

  node roomParserCli.js iCalendar <file> <start> <end>

* Verify the quality of the time use data :

  node roomParserCli.js averageChart <file>

* Synthetic visualization of the room :

* Rank and prioritize classroom capacities :

  