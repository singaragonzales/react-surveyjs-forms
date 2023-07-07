import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react"
import { FunctionFactory } from "survey-core";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import './App.css';
import React from "react";

const options = {
  showLogicTab: true,
  isAutoSave: false,
  showState: true
};

export function App() {
  const [creatorSurvey, setCreatorSurvey] = React.useState(new SurveyCreator(options));
  const [showSurvey, setShowSurvey] = React.useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result;
        try {
          const parsedJSON = JSON.parse(contents);
          deleteInitialIndex(parsedJSON);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  function deleteInitialIndex( jsonObj) {
    let ob;
    if (Array.isArray(jsonObj.pages)) {
      jsonObj.pages.forEach((page) => {
        ob = deleteInitialIndexRecursive(page);
      });
      jsonObj.pages = [ob]
    }
    creatorSurvey.text = JSON.stringify(jsonObj);
    setCreatorSurvey(creatorSurvey);
    setShowSurvey(true);
  }

  function deleteInitialIndexRecursive(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === "type" && obj[key] === "assetinfocomponent") {
          obj[key] = "text";
        }
        if (key === "expression") {
          const value = obj.expression
          obj.defaultValueExpression = value;
          delete obj.expression
        }
        if (key === "tagBoxQuestion") {
          const value = obj.tagBoxQuestion
          obj.choicesFromQuestion = value;
          delete obj.tagBoxQuestion
        }
        if (key === "enableGetChoicesFromTagBox") {
          obj.choicesFromQuestionMode = 'selected';
          delete obj.enableGetChoicesFromTagBox
        }
        if (key === "initialIndex" || key === "fieldToLoad") {
          delete obj[key];
        } 
        if (typeof obj[key] === "object") {
          deleteInitialIndexRecursive(obj[key]);
        }
      }
    }
    return obj;
  }

  function addTimeToDate(params) {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return currentTime;
  }
  FunctionFactory.Instance.register("addTimeToDate", addTimeToDate);

  return (
    <div className="survey_main">
      <h1>Survey</h1>
      <input type="file" accept=".json" onChange={(e) => handleFileChange(e)} />
      {showSurvey &&
        <SurveyCreatorComponent creator={creatorSurvey} />
      }
    </div>
  )
}

export default App;
