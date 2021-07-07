class AbstractElement {
    constructor(index, name,label, owner, type ) {
        this.index = index;
        this.name = name;
        this.label  = label;
        this.owner = owner;
        this.type = type;
    }
}


module.exports = AbstractElement;