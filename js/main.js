window.onload = function(){
	var pad = document.getElementById('pad');

	if(document.addEventListener){
		pad.addEventListener('click', padClickHandler, false);
	}else if(document.attachEvent){
		//for IE
		pad.attachEvent('click', numClickHandler);
	}
}

var isArithPressed = false,
	isEqualsPressed = false,
	isNumPressed = true,
	isDotPressed = false,
	removeEntry = false,
	currentNum = 0,
	total = 0;
	numbers = [],
	ops = [],
	clearEntryNumPressed = false,
	clearEntryArithPressed = false;

function padClickHandler(event){
	//for IE
	event = event || window.event;
	event.target = event.target || event.srcElement;

	var digit = document.getElementById('digit'),
		calc = document.getElementById('calc');

	if(/num/.test(event.target.className)){
		if(isEqualsPressed){
			//start fresh
			clearClickHandler();
			calc.textContent = '';
			isEqualsPressed = false;	
		}

		//prevent multiple entries of dot
		if(/dot/.test(event.target.className) && isDotPressed){
			return;
		}

		//get last num entered to continue expanding
		if(clearEntryArithPressed){
			currentNum = numbers[numbers.length - 1];
			numbers.pop();
			clearEntryArithPressed = false;
		}

		currentNum += event.target.textContent;
		calc.textContent += event.target.textContent;

		while(calc.textContent.charAt(0) === '0'){
			//remove leading zero unless used in calculation
			if(calc.textContent.length === 1){ break };
			if(['.', '+', 'x', '/', '-'].includes(calc.textContent.charAt(1))){ break };
			calc.textContent = calc.textContent.substr(1);
		}

		isArithPressed= false;
		isNumPressed = true;
		isEqualsPressed = false;
		removeEntry = false;

		if(/dot/.test(event.target.className)){
			isDotPressed = true;
			return;
		}
		return;
	}

	if(/arithmetic/.test(event.target.className)){

		//only if num has been pressed beforehand
		addNumber();

		if(isEqualsPressed){
			calc.textContent = total;
			numbers = [total];
			ops = [];
			isEqualsPressed = false;
		}

		//replace previous arithmetic op pressed with new
		if(isArithPressed){
			calc.textContent = calc.textContent.substr(0, calc.textContent.length - 1);
			ops.pop();
		}

		ops.push(event.target.textContent);
		calc.textContent += event.target.textContent;

		isArithPressed = true;
		isEqualsPressed = false;
		isNumPressed = false;
		isDotPressed = false;
		clearEntryArithPressed = false;

		return;	
	}

	if(/equals-op/.test(event.target.className)){
		var operators = {
			'+': function(a, b){return a + b},
			'-': function(a, b){return a - b},
			'x': function(a, b){return a * b},
			'/': function(a, b){return a / b}
		};

		//if dot not followed by digit throw error when equals press
		if(/\.(?=[x*-/])|\.$/g.test(calc.textContent)){
			digit.textContent = "error";
			isEqualsPressed = true;
			return;
		}

		//need a num before equals press
		if(isArithPressed){
			digit.textContent = "error";
			return;
		}

		//only if num has been pressed beforehand
		addNumber();

		for(var i = 0; i < ops.length; i++){
			if(i === 0){
				total = operators[ops[0]](numbers[0], numbers[1]);
				continue;
			}
			var numToOperate = numbers[i + 1];
			total = operators[ops[i]](total, numToOperate);
		}

		//fix floating point number precision
		total = Number(total.toPrecision(7));
		digit.textContent = total;

		//reduce font size of number text if too large
		if(digit.textContent.length > 10){
			digit.classList.add('changed');
		}else{
			digit.classList.remove('changed');
		}

		//if single digit press followed by equals press
		if(isNumPressed && !isArithPressed && calc.textContent.length === 1){
			digit.textContent = calc.textContent;
			total = Number(calc.textContent);
		}

		isEqualsPressed = true;
		isDotPressed = false;
		isNumPressed = false;
		isArithPressed = false;
		return;
	}

	if(/clear-entry/.test(event.target.className)){
		digit.textContent = '0';

		if(isArithPressed){
			calc.textContent = calc.textContent.substr(0, calc.textContent.length - 1);
			ops.pop();

			//step back and replicate situation of num being pressed
			isArithPressed = false;
			isNumPressed = true;
			isEqualsPressed = false;
			removeEntry = true;//included to avoid adding another number (in this case 0) to numbers array when arith is pressed
			clearEntryArithPressed = true;

		}else if(isNumPressed && calc.textContent !== '0'){

			if(clearEntryNumPressed){
				clearClickHandler();
				return;
			}

			//remove num from calc.text using regex
			calc.textContent = calc.textContent.replace(/\d+$/g, '');
			//reset as whole num has been removed from text
			currentNum = 0;

			//step back and replicate situation of arithmetic op being pressed
			isArithPressed = true;
			isNumPressed = false;
			isEqualsPressed = false;
			isDotPressed = false;
			clearEntryNumPressed = true;

		}else{
			clearClickHandler();
		}
		return;
	}

	if(/clear/.test(event.target.className)){
		clearClickHandler();
		return;
	}

	//func delclarations	
	function clearClickHandler(){
		digit.textContent = '0';
		calc.textContent = '0';
		numbers = [];
		ops = [];
		isDotPressed = false;
		isArithPressed = false;
		isEqualsPressed = false;
		isNumPressed = true;
		isDotPressed = false;
		removeEntry = false;
		total = 0;
		currentNum = 0;
		clearEntryArithPressed = false;
		clearEntryNumPressed = false;
		digit.classList.remove('changed');
	}

	function addNumber(){
		//add num to array after arithmetic or equals press
		//removeEntry included for the case when clearEntryClickHandler is called and to prevent 0 being pushed to numbers array after another arith press
		if(isNumPressed && !removeEntry){
			numbers.push(Number(currentNum));
			currentNum = 0;
			console.log(numbers);
		}
	}
}
