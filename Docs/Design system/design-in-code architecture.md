# Guidelines for implementing the design system in code.
The following are general requirements for the design-system should be architected in code. These principles should be enforced via linting or validation scripts. 

* There is a global variables file, built directly from tokens exported from Figma. (We will need a script for this).
* There is a global CSS file that contains a minimal set of universal styles. For example, type settings.
* Component styles should be contained and scoped to the component itself
* Raw or hardcoded CSS values should be minimized. Whereever possible, token-based variables should be used.
* There is a design-system validation script/mechanism (run either automatically or on-demand) that assesses code based on these principles and generates a list of identified deviations.
* Code-linting should be used within or alongside validation

### Handling deviations
Design-system validation should create and/or update a running backlog file of deviations. This running list can serve as a to-do list for future agents or clena-up efforts.