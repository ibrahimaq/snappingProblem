///// ASSUMPTIONS //////
/*
    1.  All vertices in verticesA array are in sequential order i.e. vertex A followed by vertex B then C etc
        and NOT vertex A followed by vertex D then B etc...
    
    2.  The vertices in verticesA are the main vertices of shape A and does not include the midpoints between
        two adjacent vertices.
    
    3. All vertices of both polygons are rounded to an appropriate degree of accuracy
*/

///////FORMULAS USED //////////
/* 
    Calculating midpoints between vertices in polygon A:
        (  (x1 + x2)/2  ,   (y1 + y2)/2  )

    Using Pythagoras to calculate the distance between any two vertices on polygon A and polygon B
        X_DISTANCE = x1-x2;
        Y_DISTANCE = y1-y2;
        DISTANCE = Math.sqrt(X_DISTANCE*X_DISTANCE + Y_DISTANCE*Y_DISTANCE);
*/

/////////// APPROACH USED ///////////
/*

    The tackle this problem, given some limitations, I implemented this logic:

    1.  Get midpoints of verticesA by making a copy of verticesA and 'shifting' all values by one so I am able to loop over the two arrays
        and calculate the midpoints. Store these midpoints in a new array.

    2.  Iterate over the verticesA and vertices B arrays to calculate shortest distance. I would break the 'loop/iteration' as soon 
        as the first shortest distance below 20px is found. I believe this improves performance. However I understand there may be
        some cases where we would not want to break the iteration e.g. we may have a shorter distance to a vertex than the first distance.
        Though I did decide to break the loop as I felt there are no mention of these 'exceptional' cases in the exerices.

    3.  If a snap is found we store the snap details in an object. Otherwise return isSnapped = false.

*/


    //Blue polygon
    verticesA = [
        [x1,y1],
        [x2,y2],
        [xn,yn]    
    ];
    //Red polygon - snapping onto verticesA
    verticesB = [
        [x1,y1],
        [x2,y2],
        [xn,yn]
    ];

const dragmove = (verticesA, verticesB) =>{

    //initialising variables
    let verticesBsnapped = []; //return variable
    let snapDetails = {};   // return variable
    let isSnapped = false;  //return variable
    let isMidpoint = null;  //truthy value that is passed to getShortestDistance function when calculating distances to midpoints.
    let allMidpointArr = [];    //array to store all midpoints once found
    

    // ------------------ //

  
  //making a copy of vertices A, removing first element and adding it to the end of the array
  let verticesAshiftedByOne = verticesA.slice(1);
  verticesAshiftedByOne.push(verticesA[0]);
  
  
  
  //  outer loop - looping through the outer array of verticiesAshiftedByOne
  //inner loop - looping through each value of inner arrays
  for (let i = 0; i < verticesAshiftedByOne.length; i++) {
    let midpointCoord = []; // to store midpoint coordinate before pushing into allMidpointArray
  
    for (let j = 0; j < verticesAshiftedByOne[i].length; j++) {
      //finding a single midpoint between two adjacent vertices and storing it in the midpointCoord array to form a coordinate before pushing into the allMidpoint array
      midpointCoord.push((verticesAshiftedByOne[i][j] + verticesA[i][j]) / 2);
    }
    //pushing the coordinate into the allMidpointArr
    allMidpointArr.push(midpointCoord);
  }
  // console.log("allMidPointArr: ", allMidpointArr);
  
 
  //  calculating shortest distance - see function below.
  getShortestDistance(verticesA, verticesB, (isMidpoint = false));


  /*

    How getShortestDistance function works:
        1.  calculate distances between each vertex between verticesA and verticesB using Pythagoras (formula above).
        2. loop breaks on the first distance that is less than 20px and store snapDetails as well as trigger getNewVerticesOfPolygonB function.
        3.  if no snap is found then re-call the function but this time pass allMidpointArray and set isMidpoint = true.
            Reason for isMidpoint truthy value is so that it triggers the correct if statement.
        4. Function runs again and calculates distances between verticiesB and midpoints of verticesA.
  */


  function getShortestDistance(arr1, arr2, isMidpoint) {
    for (let i = 0; i < arr2.length; i++) {
      let breakLoop = false;
  
      for (let j = 0; j < arr1.length; j++) {
        let X_DISTANCE = arr1[j][0] - arr2[i][0];
        let Y_DISTANCE = arr1[j][1] - arr2[i][1];
        let DISTANCE = Math.sqrt(
          X_DISTANCE * X_DISTANCE + Y_DISTANCE * Y_DISTANCE
        );
  
        // if distance is less than 20px, store snap details in snapDetails object and break the loop to improve performance
        if (!isMidpoint && DISTANCE < 20) {
          snapDetails.vertexAsnapped = arr1[j];
          snapDetails.vertexBsnapped = arr2[i];
          snapDetails.snapDistance = DISTANCE;
          isSnapped = true;

          //get new vertices of polygonB. See function below for more details.
          getNewVerticesOfPolygonB(
            X_DISTANCE,
            Y_DISTANCE,
            arr2,
            verticesBsnapped,
            isSnapped
          );
          breakLoop = true;
          break;
        }
        //this if statmenet will be triggered on the second iteration when no match is found to the main vertices, hence the use of isMidpoint.
        else if (isMidpoint && DISTANCE < 15) {
          snapDetails.midpointAsnapped = arr1[j];
          snapDetails.vertexBsnapped = arr2[i];
  
          //storing adjacent vertices of midpoint by using the index of snapped midpoint to locate adjacent vertices from verticesA array.
          snapDetails.verticesAinvolved = [verticesA[j - 1], verticesB[j + 1]];
          isSnapped = true;
          //get new vertices of polygonB
          getNewVerticesOfPolygonB(
            X_DISTANCE,
            Y_DISTANCE,
            arr2,
            verticesBsnapped,
            isSnapped
          );
          breakLoop = true;
          break;
        }
      }
      if (breakLoop) {
        break;
      }
    }
    //if on the first iteration no match/snap is found we call the function again but this time with the midpoint array to check all midpoints.
    if (!isSnapped && !isMidpoint) {
      getShortestDistance(allMidpointArr, verticesB, (isMidpoint = true));
    } else {
      //no match is found with vertices and/or midpoints
      isSnapped = false;
    }
  }
  
  // function that calculates new vertices of PolygonB if snapped. It works by adding the snap distance to each vertex in verticesB.
  function getNewVerticesOfPolygonB(
    X_DISTANCE,
    Y_DISTANCE,
    verticesB,
    verticesBsnapped,
    isSnapped
  ) {
 
    //if no snap then verticesBsnapped is identical to verticesB
    if (!isSnapped) {
      verticesBsnapped = verticesB;
    }
    //if snapped then calculate new coordinates of polygonB.
    // This is done by adding the x and y distance to each vertex in verticesB and passing onto verticesBsnapped array.
    else {
      for (let i = 0; i < verticesB.length; i++) {
        verticesBsnapped[i] = [
          verticesB[i][0] + X_DISTANCE,
          verticesB[i][1] + Y_DISTANCE
        ];
      }
    }
  }

  return {isSnapped, snapDetails, verticesBsnapped};
  
}
