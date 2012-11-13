JSPrelude
=========

By Vincent Ketelaars and Chris Tanaskoski

Welcome to Prelude!
-------------------
Currently we offer two versions, a version for Node.js and a plain browser version. To
use Prelude in your web page include the following scripts:

```html
<script type="text/javascript" src="infinite.browser.js"></script>
<script type="text/javascript" src="operators.browser.js"></script>
<script type="text/javascript" src="prelude.browser.js"></script>
```



### Examples
You can execute the following examples in your JavaScript console. Currently only 
Chrome and Node.js have been tested! For examples see the tests.js file.


Let's compute the sum of a list using a fold
```javascript
Prelude.foldl1(Operators.add)([0,1,2,3,4,5,6,7,8,9]);
```
> 45

But why not use `sum`instead?
```javascript
Prelude.sum([0,1,2,3,4,5,6,7,8,9]);
````

Lets create an infinite list of numbers and get the first 10
```javascript
Prelude.take(10)(new InfiniteLists.Iterate(Operators.add(1),0))
```
> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

Summing over the first 100 of these is easy as well!
```javascript
Prelude.sum(Prelude.take(100)(new InfiniteLists.Iterate(Operators.add(1),0)))
```
> 4950