import React, { Component } from "react";
import { Button, Container, Navbar, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Playground from "./components/playground.jsx";
import Portrait from "./components/portrait.jsx";
import Jumbler from "./lib/jumble.js";
import styles from "./App.module.css";

class App extends Component {
  textInputRef = React.createRef();
  textOutputRef = React.createRef();
  defaultTextInput = "";

  state = {
    textInput: "",
    textOutput: "",
    counter: 0,
    playgroundVisible: false
  };

  async componentDidMount() {
    // One-off loading of text from text file when component did mount
    try {
      const response = await fetch("/dist/initial-text.txt");
      if (!response.ok) throw new Error("HTTP response not OK");
      const data = await response.text();
      this.defaultTextInput = data;
      this.setState({
        textInput: data,
      });
      console.log(data);
    } catch (error) {
      console.error("Error fetching text file from source:", error);
      this.setState({ textInput: "Error fetching text file from source" });
    }
  }

  handleReset = () => {
    this.setState({
      textInput: "",
      textOutput: "",
      counter: 0
    }, () => {
      if (this.textInputRef.current) {
        this.textInputRef.current.focus();
      }
    });
  };

  handleDefault = () => {
    this.setState({
      textInput: this.defaultTextInput,
      textOutput: "",
      counter: 0
    }, () => {
      if (this.textInputRef.current) {
        this.textInputRef.current.focus();
      }
    });
  };

  handleJumble = () => {
    let newTextInput = this.textInputRef.current.value;
    let jumbler = new Jumbler(newTextInput);
    let newTextOutput = jumbler.getJumbledText(true);
    this.setState({
      textOutput: newTextOutput,
      counter:
        newTextInput.length === 0
          ? 0
          : newTextInput !== this.state.textInput
            ? 1
            : this.state.counter + 1
    });
  };

  handleChange = (event) => {
    this.setState({
      textInput: event.target.value,
    });
  }

  handleShowPlayground = () => {
    this.setState({
      playgroundVisible: !this.state.playgroundVisible
    });
  };

  renderPlayground() {
    if (this.state.playgroundVisible) {
      return (
        <Playground
          onDefault={this.handleDefault}
          onReset={this.handleReset}
          onJumble={this.handleJumble}
          onChange={this.handleChange}
          textInputRef={this.textInputRef}
          textInput={this.state.textInput}
          textOutputRef={this.textOutputRef}
          textOutput={this.state.textOutput}
          counter={this.state.counter}
        />
      );
    }
  }

  render() {
    const playgroundVisible = this.state.playgroundVisible;
    const buttonText = playgroundVisible ? "Hide!" : "Try it out!";

    return (
      <React.Fragment>
        <header>
          <Navbar className="p-2" variant="dark" bg="dark" expand={false}>
            <Navbar.Brand>
              <strong>About</strong>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbar-content" />
            <Navbar.Collapse>
              <Container className={styles.nbContainer}>
                <Row>
                  <Col sm={9}>
                    <p lang="en" className="text-white">I’m Michael Glavitsch, a passionate engineer with over 30 years of project experience in the ICT industry, from software engineering to IT management.
                    </p>
                    <p lang="en" className="text-white">I’m still fascinated by how technology can open doors and create new opportunities.</p>
                    <p lang="en" className="text-white">Since 2020, I’ve been working as an IT Solution Architect at <a href="https://ch.detecon.com" className={styles.dtclink} target="_blank" rel="noopener noreferrer">Detecon (Schweiz) AG</a>, contributing to cloud and API-driven architectures. In 2022, I had the privilege of being the lead author of the <a href="https://www.bk.admin.ch/bk/en/home/digitale-transformation-ikt-lenkung/bundesarchitektur/api-architektur-bund.html" className={styles.links} target="_blank" rel="noopener noreferrer">API Architektur Bund</a>.</p>
                    <p lang="en" className="text-white">I’m deeply familiar with AWS Cloud architecture, not only from a conceptual viewpoint but also hands-on, as reflected on this site. This page is developed and maintained by me, simply because I love creating things that work.</p>
                    <p lang="en" className="text-white">Feel free to reach out and connect with me on <a href="https://www.linkedin.com/in/michael-glavitsch/" className={styles.links} target="_blank" rel="noopener noreferrer">LinkedIn</a>.</p>
                    <Portrait alt="Michael Glavitsch" />
                    <ul className="list-unstyled" style={{ marginTop: "1rem" }}>
                      <li className="text-white"><a href="https://www.credly.com/badges/a8dbaff0-34ac-4653-8768-5b163dc96b16/public_url" className={styles.links} target="_blank" rel="noopener noreferrer">AWS Certified Solutions Architect - Professional</a></li>
                      <li className="text-white"><a href="https://www.credly.com/badges/0dc4a567-77c8-45f8-b5ce-12101749c652/public_url" className={styles.links} target="_blank" rel="noopener noreferrer">AWS Certified Solutions Architect - Associate</a></li>
                      <li className="text-white"><a href="https://www.credly.com/badges/4002abc8-5321-4e4d-87ec-50a9d05ec871/linked_in_profile" className={styles.links} target="_blank" rel="noopener noreferrer">AWS Certified Cloud Practitioner</a></li>
                      <li className="text-white"><a href="https://www.credly.com/badges/8da16d7f-6630-446e-a3a9-700e9738582b/linked_in_profile" className={styles.links} target="_blank" rel="noopener noreferrer">The Open Group Certified: TOGAF&reg; 9 Certified</a></li>
                    </ul>
                    <p className="text-white">
                      The code can be inspected on <a href="https://github.com/mglavitsch/jumbler-react/tree/master/jumbler-app-js" className={styles.links} target="_blank" rel="noopener noreferrer">GitHub</a>.
                    </p>
                  </Col>
                  <Col sm={3}>
                    <p className="text-white">Contact</p>
                    <a href="https://www.linkedin.com/in/michael-glavitsch/" className={styles.links} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  </Col>
                </Row>
              </Container>
            </Navbar.Collapse>
          </Navbar>
        </header>
        <main>
          <Container className={styles.jtContainer}>
            <h1>Jumbler</h1>
            <p>
              It doesn't matter in what order the letters in a word are, the
              only important thing is that the first and last letter be at the
              right place. The rest can be a total mess and you can still read
              it without problem. This is because the human mind does not read
              every letter by itself, but the word as a whole.
            </p>
            <Button
              className={styles.buttonStyle}
              variant="info"
              type="button"
              onClick={this.handleShowPlayground}
            >
              {buttonText}
            </Button>
          </Container>
          {this.renderPlayground()}
        </main>
      </React.Fragment >
    );
  }
}

export default App;
