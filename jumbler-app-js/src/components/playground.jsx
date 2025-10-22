import React, { Component } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import styles from "./playground.module.css";

export default class Playground extends Component {
  render() {
    // Destructuring Arguments
    const {
      onDefault,
      onReset,
      onJumble,
      onChange,
      counter,
      textInputRef,
      textInput,
      textOutputRef,
      textOutput
    } = this.props;

    return (
      <Form>
        <Container className={styles.pgContainer}>
          <div className={styles.twoButtons}>
            <Button className={styles.buttons} variant="secondary" onClick={onDefault}>
              Default
            </Button>
            <Button className={styles.buttons} variant="secondary" onClick={onReset}>
              Reset
            </Button>
          </div>
          <Form.Control
            ref={textInputRef}
            className={styles.textareas}
            as="textarea"
            rows="5"
            placeholder="Write something here ..."
            value={textInput}
            onChange={onChange} />
          <Button className={styles.buttons} variant="primary" onClick={onJumble}>
            Jumble <Badge variant="light">{counter}</Badge>
          </Button>
          <Form.Control
            ref={textOutputRef}
            className={styles.textareas}
            as="textarea"
            rows="5"
            placeholder="Result"
            value={textOutput}
            readOnly />
        </Container>
      </Form >
    );
  }
}
