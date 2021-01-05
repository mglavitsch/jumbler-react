import React, { Component, Suspense, lazy } from "react";
import Button from "react-bootstrap/Button";
import Jumbotron from "react-bootstrap/Jumbotron";
import Navbar from "react-bootstrap/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

const Playground = lazy(() => import("./components/playground"));

interface IAppState {
  textInput: string;
  textOutput: string;
  counter: number;
  playgroundVisible: boolean;
}

class App extends Component<{}, IAppState> {
  state: IAppState = {
    textInput: "",
    textOutput: "",
    counter: 0,
    playgroundVisible: false
  };

  constructor(
    props: any,
    private textInputId: string,
    private textOutputId: string
  ) {
    super(props);
    this.textInputId = "textInputId";
    this.textOutputId = "textOutputId";
  }

  jumbotronStyle = {
    backgroundColor: "#ebebe0",
    padding: 40,
    borderRadius: 20
  };

  handleReset = () => {
    (document.getElementById(this.textInputId) as HTMLTextAreaElement).value =
      "";
    (document.getElementById(this.textOutputId) as HTMLTextAreaElement).value =
      "";
    this.setState({
      textInput: "",
      textOutput: "",
      counter: 0
    });
  };

  handleJumble = () => {
    import("./lib/jumble").then(moduleObj => {
      const newTextInput = (document.getElementById(
        this.textInputId
      ) as HTMLTextAreaElement).value;
      if (newTextInput.length === 0) {
        this.handleReset();
        return;
      }
      const jumbler = new moduleObj.default(newTextInput);
      const newTextOutput = jumbler.getJumbledText(true);
      (document.getElementById(
        this.textOutputId
      ) as HTMLTextAreaElement).value = newTextOutput;
      this.setState({
        textInput: newTextInput,
        textOutput: newTextOutput,
        counter:
          newTextInput.length === 0
            ? 0
            : newTextInput !== this.state.textInput
              ? 1
              : this.state.counter + 1
      });
    });
  };

  handleShowPlayground = () => {
    let newTextInput: string = this.state.textInput;
    if (this.state.playgroundVisible) {
      newTextInput = (document.getElementById(
        this.textInputId
      ) as HTMLTextAreaElement).value;
    }
    this.setState({
      textInput: newTextInput,
      playgroundVisible: !this.state.playgroundVisible
    });
  };

  renderPlayground() {
    if (this.state.playgroundVisible) {
      return (
        <Suspense fallback={<h2>Loading...</h2>}>
          <Playground
            onReset={this.handleReset}
            onJumble={this.handleJumble}
            textInputId={this.textInputId}
            textInput={this.state.textInput}
            textOutputId={this.textOutputId}
            textOutput={this.state.textOutput}
            counter={this.state.counter}
          />
        </Suspense>
      );
    }
  }

  render() {
    const playgroundVisible = this.state.playgroundVisible;
    const buttonText = playgroundVisible ? "Hide!" : "Try it out!";

    return (
      <React.Fragment>
        <header>
          <Navbar
            variant="dark"
            style={{ backgroundColor: "#4d4d33" }}
            expand="xl"
          >
            <Navbar.Brand>
              <strong>About</strong>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <div className="container">
                <div className="row">
                  <div className="col-sm-8">
                    <p className="text-white">
                      This page is powered by ReactJS, TypeScript and React-Bootstrap.
                    </p>
                  </div>
                  <div className="col-sm-4">
                    <h5 className="text-white">Contact</h5>
                    <ul className="list-unstyled">
                      <li className="text-white">Michael Glavitsch</li>
                      <li className="text-white">
                        <a
                          href="https://www.linkedin.com/in/michael-glavitsch/"
                          className="text-white"
                        >
                          LinkedIn
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Navbar.Collapse>
          </Navbar>
        </header>
        <main>
          <Jumbotron style={this.jumbotronStyle}>
            <h1>Jumbler</h1>
            <p>
              It doesn't matter in what order the letters in a word are, the
              only important thing is that the first and last letter be at the
              right place. The rest can be a total mess and you can still read
              it without problem. This is because the human mind does not read
              every letter by itself, but the word as a whole.
              </p>
            <Button
              variant="info"
              type="button"
              onClick={this.handleShowPlayground}
            >
              {buttonText}
            </Button>
          </Jumbotron>
          {this.renderPlayground()}
        </main>
      </React.Fragment>
    );
  }
}

export default App;
