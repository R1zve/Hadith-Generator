var boolbase = {
	trueFunc: function trueFunc(){
		return true;
	},
	falseFunc: function falseFunc(){
		return false;
	}
};

export default boolbase;
var trueFunc = boolbase.trueFunc;
export { boolbase as __moduleExports, trueFunc };
