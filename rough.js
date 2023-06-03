let student = {
    name : "Akhil",
    rollno : "CED18I032",
    place : "Ongole"
}
student.jersey = "9";

console.log(typeof(student));
console.log(typeof(Object.keys(student)));
console.log(Object.values(student));



const toDelete1 = '5'
const toDelete2 = '6'
const toDelete = ['5' ,'6']
const original = ['1' , '3']

//check todelete item is in original
let x = original.includes(toDelete1);
let y = original.includes(toDelete2);

const res = original.filter( item => !toDelete.includes(item));
console.log(res);
console.log(x);
console.log(y);

let extras = [res.join("") ]
if(x){
    extras.push('5');
}
if(y){
    extras.push('6')
}

extras.forEach(function(item){
    console.log(item);

    switch(item){

        case "1" : console.log("wide");
        break;
    
        case "13" : console.log("wide + byes"); 
        break;
    
        case "2" : console.log("Noball");
        break;
    
        case "23" : console.log("Noball + byes"); 
        break;
    
        case "24" : console.log("Noball + legbyes");
        break;
    
        case "3" : console.log("byes");
        break;
    
        case "4" : console.log("legbyes");
        break;
    
        case "5" : console.log("wicket"); break;
        
        case "6" : console.log("retire") ; break;
    
        default : console.log("Good Ball"); break;
    
    }

});

let val='0';
if(Number(val)){
    console.log("value = 0");
}
else{
    console.log("Else");
}

let arr = ['1' , '5']
console.log(typeof(arr));
console.log(arr.join(""));
console.log(typeof(arr.join("")));

const val1 = 20;
const val2 = "10"

const res1 = Number(val2) + Number("0." + val1) ;
console.log(res1);



/*
wide=1 noball=2 byes=3 legbyes=4 wicket=5
x1 = [1]  # wide
x2 = [1, 3]  # wide + byes
x3 = [1, 5]  # wide + wicket
x4 = [1, 3, 5]  # wide +byes +wicket

x5 = [2]  # noball
x6 = [2, 3]  # noball +byes
        [2, 4]  #noball + legbyes
x7 = [2, 5]  # noball + wicket
x8 = [2, 3, 5]  # noball +byes + wicket
    [2, 4, 5] # noball +legbyes +wicket

x9 = [3]  # byes
x10 = [3, 5]  # byes + wicket

x11 = [4]  # legbyes
x12 = [4, 5]  # legbyes + wicket

x13 = [5]  # wicket
*/