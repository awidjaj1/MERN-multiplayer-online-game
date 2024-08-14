export default class InputHandler{
    constructor(socket){
        this.inputs = {
            w: false,
            a: false,
            s: false,
            d: false
        }
        this.clicks = {
            left: false,
            right: false,
            middle: false,
            back: false,
            forward: false,
        };
        socket.on("mousedown", (button) => {
            this.clicks[button] = true;
        });

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