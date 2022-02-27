const guideList = document.querySelector('.guides');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinkes = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');

var matrix = {}

const setupUI = (user) => {
    if (user) {
        //account info
       // db.collection('users').doc(user.uid).get().then(doc => {
            //const html = `
            //<div> logged in as ${user.email}</div>
            //<div>${doc.data().bio}</div>

         //`;
         //accountDetails.innerHTML = html;

        //})
        

        //toggle UI elements
        loggedInLinkes.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none'); 
        
    } else {
        //hide account info
        //toggle UI elements
        loggedInLinkes.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block'); 
        
    }
}
//setup guides

const setupGuides = (data) => {
    if (data.length) {
        let html = '';
        data.forEach(doc => {
        const guide = doc.data();
       
        const li = `
        <li>
            <div class = "collapsible-header grey lighten-4"  style = "width:100%;"> <i class="material-icons">${guide.food}</i></div>
            <div class = "collapsible-body white" > ${guide.rating}  </div>
        </li>
        `;
        html += li;
       
        matrix[guide.name] = {};
    
    });
  
    guideList.innerHTML = html;
    

    }else {
        guideList.innerHTML = ``;
    
    }
 
}

//set up materialize content
document.addEventListener('DOMContentLoaded', function() {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);

});

const recommending = (data) => {
    if (data.length) {
        data.forEach(doc => {
        const guide = doc.data();
       
        matrix[guide.name][guide.food] = parseInt(guide.rating);
        })
        

        return matrix;
        
            
    }

    else {
        //guideList.innerHTML = `<h5 class= "center-align"> Login To Rate Your College Food! </h5>`;
        return matrix;
    
    }
 
}

var pearson_correlation = function(dataset, p1, p2) {

    var existp1p2 = {};
    for (var item in dataset[p1]) {
      if (item in dataset[p2]) {
        existp1p2[item] = 1
      }
    }
    var num_existence = Object.keys(existp1p2).length;
    // console.log(existp1p2)
    if (num_existence == 0) return 0;
    //store the sum and the square sum of both p1 and p2
    //store the product of both
    var p1_sum = 0,
      p2_sum = 0,
      p1_sq_sum = 0,
      p2_sq_sum = 0,
      prod_p1p2 = 0;
    //calculate the sum and square sum of each data point
    //and also the product of both point
    for (var item1 in existp1p2) {
      p1_sum += dataset[p1][item1];
      // console.log(dataset[p1][item1])
      p2_sum += dataset[p2][item1];
      
      p1_sq_sum += Math.pow(dataset[p1][item1], 2);
      p2_sq_sum += Math.pow(dataset[p2][item1], 2);
      prod_p1p2 += dataset[p1][item1] * dataset[p2][item1];
    }
    var numerator = prod_p1p2 - (p1_sum * p2_sum / num_existence);

    // console.log(p1_sq_sum)
    // console.log(p2_sq_sum)
    // console.log(prod_p1p2)
    // console.log(num_existence)
    var st1 = p1_sq_sum - Math.pow(p1_sum, 2) / num_existence;
  
    var st2 = p2_sq_sum - Math.pow(p2_sum, 2) / num_existence;
    var denominator = Math.sqrt(st1 * st2);
    if (denominator == 0) return 0;
    else {
      var val = numerator / denominator;
      return val;
    }
  
  };
  
  //var num = pearson_correlation(dataset, 'Lisa Rose', 'Jack Matthews');
  //console.log("Testing PEARSON");
  //console.log(num);
  // console.log(dataset)
  // console.log(1)
  
  var similar_user = function(dataset, person, num_user, distance) {
    var scores = [];
    for (var others in dataset) {
      if (others != person && typeof(dataset[others]) != "function") {
        var val = distance(dataset, person, others)
        var p = others
        scores.push({
          val: val,
          p: p
        });
      }
    }
    scores.sort(function(a, b) {
      return b.val < a.val ? -1 : b.val > a.val ? 1 : b.val >= a.val ? 0 : NaN;
    });
    var score = [];
    for (var i = 0; i < num_user; i++) {
      score.push(scores[i]);
    }
    return score;
  
  }
  //var temp = similar_user(dataset, 'Jack Matthews', 3, pearson_correlation);
  //console.log("Testing similar_user");
  //console.log(temp);
  
  var recommendation_eng = function(dataset, person, distance) {
  
    var totals = {
        //you can avoid creating a setter function
        //like this in the object you found them
        //since it just check if the object has the property if not create
        //and add the value to it.
        //and  because of this setter that why a function property
        // is created in the dataset, when we transform them.
        setDefault: function(props, value) {
          if (!this[props]) {
            this[props] = 0;
          }
          this[props] += value;
        }
      },
      simsum = {
        setDefault: function(props, value) {
          if (!this[props]) {
            this[props] = 0;
          }
  
          this[props] += value;
        }
      },
      rank_lst = [];
    for (var other in dataset) {
      if (other === person) continue;
      var similar = distance(dataset, person, other);
    
  
      if (similar <= 0) continue;
      for (var item in dataset[other]) {
        if (!(item in dataset[person]) || (dataset[person][item] == 0)) {
          //the setter help to make this look nice.
          totals.setDefault(item, dataset[other][item] * similar);
          simsum.setDefault(item, similar);
  
  
        }
  
      }
  
  
    }
  
    for (var item in totals) {
      //this what the setter function does
      //so we have to find a way to avoid the function in the object
      if (typeof totals[item] != "function") {
  
        var val = totals[item] / simsum[item];
        rank_lst.push({
          val: val,
          items: item
        });
      }
    }
    rank_lst.sort(function(a, b) {
      return b.val < a.val ? -1 : b.val > a.val ?
        1 : b.val >= a.val ? 0 : NaN;
    });
    var recommend = [];
    for (var i in rank_lst) {
      recommend.push(rank_lst[i].items);
    }
    // return [rank_lst, recommend];
    return recommend;
  }
  //console.log("Testing recommendation");
  //for (person in dataset){
    //var temp2 = recommendation_eng(dataset, person, pearson_correlation);
    //console.log(temp2)
  //}

  
