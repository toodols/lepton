# Lepton-Client
A package for interacting with Lepton's API without having to use low level fetch and stuff. This package built into Lepton but can also be used independently to create bots.

## Initialization chain:
Due to circular classes that reference each other, the constructor of a class cannot yet assign references to other classes. Some classes are given higher priority than others. Classes higher on this list will get created first, than lower classes will be created automatically with references to the higher classes. After that, the higher classes will then be assigned their references to the lower classes. (Are you getting this yet?)
```
1. Group
2. User
3. Post
4. Comment

Example:

(post constructor)
	post.id = id;
	post.author = author;

(comment constructor)
	comment.id = id
	comment.author = author
	comment.post = post

(post afterinit)
	post.lastComment = comment
```