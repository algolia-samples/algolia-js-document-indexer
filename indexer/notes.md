# Introduction
Use-case definition: We have a lot of projects that we've done as part of consultation with markdown documentation. When we're supporting existing solutions or new defining new projects, we often want to search through documentation about our existing ones - we don't have a solution for that, which is costing man hours.

We need to be able to search for the projects related to specific topics to check implementation, get ideas from code and so on.
Sales people also need a solution to be able to determine what kind of projects we did for a certain topic to be able to communicate it.
Developers need an 'internal stackoverflow' kind of thing, since we're doing a lot of deep technical stuff in Tableau, info is sometimes not on the public internet - they are stealing our own code from previous stuff.
Project managers need to be able to determine who has worked with certain technologies - this info is in the documentation, we just need to be able to find it.

In short, we need to be able to search for our own projects based on the following attributes:
- Technologies used (coding languages, databases, etc)
- Project keywords (tags)
- Project documentation itself - install instructions to see what need to be installed (helps finding projects for technologies), tech docs, etc
- Timeframe

All these attributes exist in the internal documentation markdowns - we need a way to search them

# Implementing the Algolia index
As a PoC, we developed a Command Line application in nodeJS. It:
- Scrapes the top X GitHub public repositories and gets the README.md documentation files (this represents our internal projects)
- Stores the documentation files in Algolia alongside with project basic information (title, programming languages, tags)
The CLI tools contains advanced logging, command line arguments for ease of use. We will host it on the web, people can try it out

## Challenge
The biggest challenge inside Algolia is the record size - Algolia only allows max 100KB records in the Algolia index - many markdown documentation files are much larger.
Solution - we need to split up the markdown documentation files to multiple pieces, and store a single project information as multiple records inside Algolia. We also need to make sure that when we search for something, a single project only appears once (even tho it is split to multiple records, which would allow it to be in the list of results multiple times). We use Algolia distinct search for that (there is an example in the Algolia docs page, where it explains the size limitation for records and recommends this exact scenario with the splitting)

Because of this, the number of GitHub repos we retrieve from GitHub is flexible (we only have 10k records in the Algolia free tier, at this point it does not mean 10k GitHub repositories, it will be much less as they are split to multiple records)

# Implementing the Frontend
TODO.
A small frontend application will be able to list results for a certain phrase.
Will be hosted online, possible StackBlitz.
Challenge: need to make sure that every project appears once (even tho they are split to multiple records, and more of them might match a phrase)

# Conclusion
If Algolia works great (why wouldnt it) then the conclusion is that Algolia works great.