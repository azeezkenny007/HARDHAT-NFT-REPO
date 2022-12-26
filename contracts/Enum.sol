pragma solidity ^0.8.0;

// This contract uses an `enum` to define a set of possible states for a
// contract variable.
contract EnumExample {
    // Define the `enum` type.
    enum State {
        Uninitialized,
        Initialized,
        Active,
        Inactive
    }

    // Define a state variable of the `enum` type.
    State private state;

    // Constructor function that initializes the state variable.
    constructor() public {
        // Set the initial state to `Uninitialized`.
        state = State.Uninitialized;
    }

    
    // Function that sets the state to `Initialized`.
    function initialize() public {
        // Set the state to `Initialized`.
        state = State.Initialized;
    }

    // Function that sets the state to `Active`.
    function activate() public {
        // Ensure that the contract has been initialized.
        require(state == State.Initialized, "Error: Contract not initialized");

        // Set the state to `Active`.
        state = State.Active;
    }

    // Function that sets the state to `Inactive`.
    function deactivate() public {
        // Ensure that the contract is currently active.
        require(state == State.Active, "Error: Contract not active");

        // Set the state to `Inactive`.
        state = State.Inactive;
    }

    function getState() public view returns(State){
      return state;
    }

}
