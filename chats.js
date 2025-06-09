//temporary for structure (will be replaced when the supabase implementation is complete)

//structure 1st: sender, 2nd: reciever, 3rd: message, 4th date, 5th status

//Temporary User's name is John Doe
let messages = [
    ['Billy', 'John Doe', 'When do you think we can study', new Date(2024, 4, 15, 16, 43, 5, 50), 'read'],
    ['Profesor Smith', 'John Doe', 'So how are you planning on bringing your grade up?', new Date(2024, 4, 16, 7, 50, 3, 0), 'unread'],
    ['John Doe', 'Jimmy Cooper', 'Can you share me your notes?', new Date(2024, 4, 17, 12, 55, 0, 54), 'read'],
    ['John Doe', 'Billy', 'I\'m thinking tommorow at lunch. Does that time work?', new Date(2024, 4, 18, 6, 55, 0, 54), 'read'],



];

const userName = 'John Doe';

let indexOfRecent = null;
let dateOfRecent = new Date(1000,1,1,1,1);
let discard = [];


for(let x = 0; x<3;x++){
    for(let i = 0; i< messages.length; i++){
        for(let z = 0; z<discard.length;z++){
            if(discard[z] = i){
                continue;
            }
        }
        if(messages[i][0] == userName || messages[i][1] == userName){
            if(messages[i][3].getDate() > dateOfRecent){
                indexOfRecent = i;
                dateOfRecent = messages[i][3].getDate();
            }
        }
    
    }


    discard.push(indexOfRecent);
}


