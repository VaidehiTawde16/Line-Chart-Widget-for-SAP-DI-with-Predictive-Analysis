# Line Chart Widget for SAP DI with Predictive Analysis

## Project Overview

This project involves the development of custom ECharts Line and Column charts hosted in SAP, designed to provide dynamic, interactive, and predictive data visualizations. These charts are integrated as custom widgets within the SAP environment, leveraging the power of ECharts for smooth rendering and the simplicity of JavaScript for logic and interaction handling.

## Features

### Line Chart

Dynamic Data Binding: Seamlessly integrates with SAP data feeds to visualize dimensions and measures.

Label Enhancement: Automatically adds the year to labels for better context and readability.

Predictive Analysis: Implements linear regression to predict future data points.

Interactive Visuals: Utilizes ECharts for smooth and responsive chart rendering.

### Column Chart

Dynamic Data Binding: Similar integration with SAP data feeds.

Label Enhancement: Adds year to labels automatically.

Interactive Visuals: Uses ECharts for responsive bar chart rendering.

## Implementation Details

### Custom Functions

Linear Regression Function: The project started with the creation of a basic linear regression function in JavaScript. This function was designed to analyze the input data from SAP and predict future values based on past trends.

Data Handling: Data from SAP was inspected via the console to understand the structure at each level (e.g., year, half-year, quarter). This inspection guided the creation of specific functions to process the data accordingly.

Level-Based Functions: To handle the hierarchical structure of date data, functions were written for each level—year, half-year, quarter, etc.—ensuring accurate data processing for visualization.

ECharts Integration: ECharts was integrated to enhance the visual appeal and user experience of the charts, providing smooth and interactive data presentations.

### Handling Function Conflicts

Function Conflict Issue: Initially, both the line chart and the column chart were using the same functions for data processing and visualization. However, this led to conflicts when both charts were used together in the same environment, as the functions would interfere with each other.

Solution with IIFE: To resolve this issue in the column chart, all functions were encapsulated within an Immediately Invoked Function Expression (IIFE). This approach ensures that the functions are isolated within the column chart’s scope, preventing any conflicts with the line chart or other scripts.

### Column Chart

After completing the line chart, similar principles were applied to create a custom column chart. This involved using the same linear regression and data handling techniques but encapsulated in an IIFE to ensure compatibility when both charts are used simultaneously.

## Challenges & Learning

Handling dynamic data dimensions and measures without hardcoding.

Ensuring cross-browser compatibility and performance optimization.

Managing function conflicts between multiple custom widgets.

Enhancing user experience with predictive data visualization.

## Future Work

Explore additional predictive analysis techniques.

Add more customization options for the widgets.

Improve performance for larger datasets.

## Line Chart and Column Chart showcasing Predictive Analysis with Linear Regression

![image](https://github.com/user-attachments/assets/c3e6781e-348d-49ce-a70f-0e7cecc72f8c)

![image](https://github.com/user-attachments/assets/6b8fefd8-47f8-4a02-ae99-4c0d9871e8bb)

![image](https://github.com/user-attachments/assets/7fea0c54-a548-49da-94e7-ad48887b1185)








