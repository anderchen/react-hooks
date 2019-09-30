import React, { useState, useCallback, useReducer } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default: 
      throw new Error('Should not get there!')
  };
};

const httpReducer = (httpState, action) => {
  switch(action.type) {
    case 'SEND':
      return {loading: true, error: null};
    case 'RESPONSE':
        return {...httpState, loading: false};
    case 'ERROR':
        return {loading: false, error: action.errorMessage};
    case 'CLEAR':
        return {...httpState, error: null};
    default: 
      throw new Error('Should not be reached!')
  };
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])
  // const [ userIngredients, setUserIngredients ] = useState([]);
  // const [ isLoading, setIsLoading ] = useState(false);
  // const [ error, setError ] = useState();
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null})

  // Already fetching in the Search Component
  // useEffect(() => {
  //   fetch('https://react-hooks-update-be740.firebaseio.com/ingredients.json')
  //     .then(response => response.json())
  //     .then(responseData => {
  //       const loadedIngredients = [];
  //       for (const key in responseData) {
  //         loadedIngredients.push({
  //           id: key,
  //           title: responseData[key].title,
  //           amount: responseData[key].amount
  //         });
  //       }
  //       setUserIngredients(loadedIngredients);
  //     });
  // }, []);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients)
    dispatch({type: 'SET', ingredients: filteredIngredients});
  }, []);

  const addIngredientHandler = ingredient => {
    // setIsLoading(true);
    dispatchHttp({type: 'SEND'});
    fetch('https://react-hooks-update-be740.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'})
      return response.json();
    }).then(responseData => {
      // setUserIngredients(prevIngredients => 
      //   [...prevIngredients, 
      //   { id: responseData.name, ...ingredient }]
      // );
      dispatch({type: 'ADD', ingredient: {id: responseData.name, ...ingredient}});
    });
  }

  const removeIngredientHandler = (ingredientId) => {
    // Anderchen Solution in the comments
    // const filterIngredients = userIngredients.filter(ingredient => ingredient.id !== ingredientId)
    // setUserIngredients(filterIngredients)
    dispatchHttp({type: 'SEND'});
    fetch(`https://react-hooks-update-be740.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE',
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'})
      // setUserIngredients(prevIngredients => 
      //   prevIngredients.filter(
      //     (ingredient) => ingredient.id !== ingredientId)
      // )
      dispatch({type: 'DELETE', id: ingredientId});
    }).catch(error => {
      // setError(error.message)
      // setIsLoading(false);
      dispatchHttp({type: 'ERROR', errorMessage: error.message})
    });
  }

  const clearError = () => {
    dispatch({type: 'CLEAR'})
  };

  return (
    <div className="App">
    {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
        />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
