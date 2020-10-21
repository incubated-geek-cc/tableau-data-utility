# Tableau Data Utility
## Basically churning out Tableau readable formats from raw input files.
# Example: Tableau Network Graph Generator
This is an enhanced version of [Tristan Guillevin’s notebook](https://observablehq.com/@ladataviz/network-data-generator). More information available at [Tutorial/Guide on Medium](https://medium.com/@xuemanxu.cc/leverage-on-d3-js-v4-to-build-a-network-graph-for-tableau-with-ease-cc274cba69ce).

## Objective: A browser web application which uses [d3.js v4](https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8) to generate Tableau ready datasets for network graph visualisations
### View [app demo](https://tableau-data-utility.herokuapp.com/) deployed on Heroku 

#### Functionalities
1. Input user's JSON file
2. Export of CSV data files for Tableau implementation
3. Adjustment of d3 network graph layout parameters: `size` `distance` `strength` `collide`
<br/>![Parameter Adjustments](https://miro.medium.com/max/1050/1*m7G3SaYIAJg1kEd7UQiv0g.png)
4. Direct adjustment of nodes to alter layout
<br/>**Demo:**<br/>![Demo of Layout Adjustment](https://miro.medium.com/max/960/1*_XoEvi8yXSj8uXXuGkuVdA.gif)
<br/>**Before Adjustment:**<br/>![Before Adjustment](https://miro.medium.com/max/1050/1*4YFXQc3_ZoccWZ26FPkNyg.png)<br/>
<br/>**After Adjustment:**<br/>![After Adjustment](https://miro.medium.com/max/1050/1*x3sAFb5uR13G3H-mC3Ye3A.png)

#### Usage Example
* Original Singapore's 2020 dengue dataset from [data.gov.sg](https://data.gov.sg/dataset/dengue-clusters)
* Geocoded and processed [JSON data file](https://github.com/incubated-geek-cc/tableau-network-graph-generator/blob/master/public/data/sg_dengue_clusters.json) for web application input i.e. to render d3.js force layout diagram
* Tableau dashboard network graph diagram with churned out datasets at [Dengue Clusters in Singapore 2020](https://public.tableau.com/profile/api/publish/SingaporesDengueClusters2020/sg_dengue_clusters_2020)
![Dashboard Preview](https://miro.medium.com/max/1050/1*zXMQnZS8B_NQkpH7F6T2Cg.png)
