export default class InputHandler{
    constructor(socket){
        this.inputs = {
            w: false,
            a: false,
            s: false,
            d: false
        }
        socket.on("keydown", (key) => {
            this.inputs[key] = true;
        });
        socket.on("keyup", (key)=>{
            if(key === 'all')
                Object.keys(this.inputs).forEach(key => this.inputs[key] = false);
            else
                this.inputs[key] = false;
        });
    }
}