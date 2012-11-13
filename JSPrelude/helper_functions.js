/**
 * This file consists of helper functions to use in the tests for the prelude.
 */

var ops = new (function() {
	
	/**
	 * Negation function
	 */
	this.negate = function(x){return !x;}
	
	/**
	 * Less than function. It takes two numbers x and y and returns the boolean; y < x.
	 */
	this.lt = function(x){
		return function(y){
			return y < x;
		}
	}

	/**
	 * Greater than function. It takes two numbers x and y and returns the boolean; y > x.
	 */
	this.gt = function(x){
		return function(y){
			return y > x;
		}
	}

	/**
	 * Multiply by 2 function. It takes a number x and returns 2 * x. 
	 */
	this.multiply2 = function(x){
		return 2*x;
	}

	/**
	 * Is even number function. It takes a number x and returns true if it is even, and false if it is odd.
	 */
	this.isEven = function(x){
		return x % 2 == 0;
	}	

	/**
	 * Sum three integers function. It takes three numbers x,y and z and returns their sum.
	 */
	this.sum3 = function(x){
		return function(y){
			return function(z){
				return x + y + z;
			}
		}
	}

	/**
	 * Subtract function. It takes two numbers x and y, and returns x-y.
	 */
	this.subtract = function(x){
		return function(y){
			return x-y;
		}
	}

	/**
	 * Expressions of list x function. It takes a list x and returns one function on it.
	 * Length of x.
	 */
	this.expressionListArray = function(x){
		return [x.length];
	}
	
	/**
	 * Expressions of x function. It takes a number x and returns three expressions of x; x , x/2 , x*2.
	 */
	this.expressionArray = function(x){
		return [x,x/2,x*2];
	}

	/**
	 * Division function. It takes two numbers x and y and returns x / y.
	 */
	this.divide = function(x){
		return function(y){
			return x / y;
		}
	}
	
	/**
	 * Equal function. It takes two numbers x and y and returns the boolean; y == x.
	 */
	this.eq = function(x){
		return function(y){
			return x == y;
		}
	}

	/**
	 * Not equal function. It takes two numbers x and y and returns the boolean; y != x.
	 */
	this.neq = function(x){
		return function(y){
			return x != y;
		}
	}
	
	/**
	 * And operation. It takes two booleans x and y and returns the boolean x && y.
	 */
	this.op_and = function (x){
		return function(y){
		if (typeof x !== 'boolean' || typeof y !== 'boolean')
			throw new NotBooleanException("The list must contain booleans.");
		return x && y;}
	}
	
	/**
	 * Or operation. It takes two booleans x and y and returns the boolean x || y.
	 */
	this.op_or = function (x){
		return function(y){
		if (typeof x !== 'boolean' || typeof y !== 'boolean')
			throw new NotBooleanException("The list must contain booleans.");
		return x || y;}
	}
	
	
	/**
	 * Sum operation. It takes two numbers x and y. Returns x + y;
	 */	
	this.op_sum = function(x){
		return function(y){
			return x+y;
		}
	}
	
	/**
	 * Multiply operation. It takes two numbers x and y. Returns x * y;
	 */	
	this.op_product = function(x){
		return function(y){
			return x*y;
		}
	}
	
	/**
	 * Max operation. It takes two numbers x and y. Returns max(x,y).
	 */
	 this.op_max = function(x){
	 	return function(y){
	 		return Math.max(x,y);
	 	}
	 };
	 
	 /**
	  * Min operation. It takes two numbers x and y. Returns min(x,y).
	  */
	 this.op_min = function(x){
	 	return function(y){
	 		return Math.min(x,y);
	 	}
	 };

	 /**
	  * Not operation. It takes an element p and returns !p.
	  */
  	 var not = function(p){
		return function(x){
			return !p(x);
		}
	 };
	
})();

module.exports = ops;
