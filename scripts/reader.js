let db = supabase.createClient(
    'https://pmfrislowxhopnexusxa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZnJpc2xvd3hob3BuZXh1c3hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk4NjExMSwiZXhwIjoyMDY0NTYyMTExfQ.TTYNG0O0nTFqS8QPimAqhC-uqmNs65Aaml1kqAtYeTQ'
);


let userId = window.localStorage.getItem("userIdentify");
let username;
let sumRead = 0;
let prevChats;

if(userId == null || userId == "null"){
    window.location.replace('/pages/signup.html');
}else{
    if(document.getElementById('readMessageNonification')){
        document.getElementById('readMessageNonification').remove();
    }
    async function fetchUser() {
        const { data, error } = await db
            .from('Users')
            .select('username')
            .eq('id', userId);

        if (error) {
            console.error('Error fetching data:', error);
            return null;
        }

        return data;
    }
    username = fetchUser();
    username = (await username)[0].username;

    TotalRead();
}




async function TotalRead(payload, index){

    if(payload){
        
        let data = payload;

        if(data.host == userId){
            sumRead += 1;
            let inboxLink = document.querySelector('a[href="/pages/chats.html"]');
            let readMessage = document.createElement('div');
            readMessage.classList.add('readMessageNonification');
            readMessage.id = 'readMessageNonification';
            readMessage.innerHTML = "" + sumRead + "";
            inboxLink.appendChild(readMessage);
            
        }
        
        for(let x = 0; x < data.members.length; x++){
            
            if(data.members[x] == "" + username + ""){
                sumRead += 1;
                let inboxLink = document.querySelector('a[href="/pages/chats.html"]');
                let readMessage = document.createElement('div');
                readMessage.classList.add('readMessageNonification');
                readMessage.id = 'readMessageNonification';
                readMessage.innerHTML = "" + sumRead + "";
                inboxLink.appendChild(readMessage);
                
            }
        }
        
        prevChats = data;

    }else{
        sumRead = 0;

        const { data, error } = await db
            .from('Chats')
            .select('members, chat_id, messages, host, read')
            .or(`members.cs.{"${username}"},host.eq."${userId}"`);

        for(let i = 0; i<data.length; i++){
            if(data[i].host == userId){
                sumRead += data[i].read[data[i].read.length - 1];

            }
            for(let x = 0; x < data[i].members.length; x++){
                
                if(data[i].members[x] == "" + username + ""){
                    sumRead += data[i].read[x];
                    
                }
            }
        }
        if(sumRead > 0){
            let inboxLink = document.querySelector('a[href="/pages/chats.html"]');
            let readMessage = document.createElement('div');
            readMessage.classList.add('readMessageNonification');
            readMessage.id = 'readMessageNonification';
            readMessage.innerHTML = "" + sumRead + "";
            inboxLink.appendChild(readMessage);
        }


        prevChats = data;
    }   

    

    

}

db
    .channel('realtime-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Chats' }, (payload) => {
       
        let count = 0;
        if(payload.new != undefined && payload.new.messages != undefined){
            for(let i = 0; i < prevChats.length; i++){
                if(JSON.stringify(prevChats[i].messages) == JSON.stringify(payload.new.messages)){
                    count++;
                    
                    prevChats[i].messages = payload.new.messages;
                }

                
            }
            

            if(count == 0){
                TotalRead(payload.new);
            }
        }
        
        

        
    })
    .subscribe();