import React, { Component } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

export default class Playground extends Component {
  render() {
    // Destructuring Arguments
    const {
      onReset,
      onJumble,
      counter,
      textInputId,
      textInput,
      textOutputId,
      textOutput
    } = this.props;

    return (
      <Form>
        <Container>
          <Row>
            <Col className="right-align">
              <Form.Group controlId="resetButton">
                <Button className="pg-style" variant="secondary" onClick={onReset}>
                  Reset
                </Button>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId={textInputId}>
                <Form.Control
                  as="textarea"
                  rows="5"
                  placeholder="Write something here ..."
                  defaultValue={textInput} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col className="right-align">
              <Form.Group controlId="jumbleButton">
                <Button className="pg-style" variant="primary" onClick={onJumble}>
                  Jumble <Badge variant="light">{counter}</Badge>
                </Button>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId={textOutputId}>
                <Form.Control
                  as="textarea"
                  rows="5"
                  placeholder="Result"
                  defaultValue={textOutput} />
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
    );
  }
}
