import React, { useState, useContext, useRef } from "react";
import API from "../../utils/API";
import Grid from "@material-ui/core/Grid";
import ExcursionCard from "../../components/ExcursionCard/ExcursionCard";
import User from "../../components/User/User";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { UserContext } from "../../utils/UserContext";
import authConfig from "../../utils/authConfigHelper";
import Divider from "@material-ui/core/Divider";

const Excursions = () => {
  const [newExcursion, setNewExcursion] = useState("");

  const { userData, setUserData, userToken } = useContext(UserContext);

  let textInput = useRef(null);

  const handleChange = ({ target: { value } }) => {
    setNewExcursion(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const excursionObj = { name: newExcursion }
    API.addExcursion(excursionObj, authConfig(userToken))
      .then(response => {
        setUserData({ ...response.data.data, isAuthenticated: true });
        setNewExcursion({ name: "" });
      })
      .catch((err) => console.log(err));
  };

  const deleteExcursion = id => {
    API.deleteExcursion(id, authConfig(userToken))
      .then(response => {
        setUserData({ ...response.data.data, isAuthenticated: true });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={12}></Grid>
        <Grid item xs={12} sm={2}>
          <User />
        </Grid>
        <Grid item xs={12} sm={9}>
          <Box
            alignItems="right"
            justifyContent="right"
            display="flex"
            p={2}
            mx="auto"
          >
            <form onSubmit={handleSubmit}>
              <TextField
                size="small"
                name="newExcursion"
                inputRef={textInput}
                placeholder="Add an Excursion"
                onChange={handleChange}
              ></TextField>
              <Button
                type="submit"
                onClick={() => {
                  setTimeout(() => {
                    textInput.current.value = "";
                  }, 300);
                }}
              >
                Submit
              </Button>
            </form>
          </Box>
          <Divider variant="middle" />
          {userData.excursions &&
            userData.excursions.map((excursion) => (
              <Grid item xs={12} sm={12} key={excursion._id}>
                <Box
                  display="flex"
                  p={1}
                  mx="auto"
                >
                  <ExcursionCard
                    randomImg="https://source.unsplash.com/1600x900/?nature,Utah"
                    excursionId={excursion._id}
                    excursionName={excursion.name}
                    deleteExcursion={deleteExcursion}
                  />
                </Box>
              </Grid>
            ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default Excursions;
