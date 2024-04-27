// import prisma from "../lib/prisma.js";
// import jwt from "jsonwebtoken";

// export const getPosts = async (req,res) =>{
//     const query = req.query;
//     try {
//         const posts = await prisma.post.findMany({
//             where:{
//                 city: query.city || undefined,
//                 type: query.type || undefined,
//                 property: query.property || undefined,
//                 bedroom: parseInt(query.bedroom) || undefined,
//                 price:{
//                     gte: parseInt(query.minPrice) || 0,
//                     lte: parseInt(query.maxPrice) || 10000000,
//                 },
//             },
//         });


//         //setTimeout(() => {
//             res.status(200).json(posts);
//         //}, 3000);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({message:"Failed to get posts"});
//     }
// }
// export const getPost = async (req,res) =>{
//     const id = req.params.id;
//     try {
//         const post = await prisma.post.findUnique({
//             where:{id},
//             include: {
//                 postDetail: true,
//                 user: {
//                     select:{
//                         username:true,
//                         avatar:true,
//                     },
//                 },
//             },
//         });

//         let userId;

//         const token = req.cookies?.token;

//         if(!token) {
//             userId = null;
//         }else{
//             jwt.verify(token, process.env.JWT_SECRET_KEY, async(err,payload)=>{
//                 if(err) {
//                     userId = null;
//                 }else{
//                     userId = payload.id;
//                 }
//             });
//         }

//         const saved = await prisma.savedPost.findUnique({
//             where: {
//               userId_postId: {
//                 postId: id,
//                 userId,
//               },
//             },
//           });

//         res.status(200).json({...post, isSaved: saved ? true : false });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({message:"Failed to get post"});
//     }
// };
// export const addPost = async (req,res) =>{
//     const body = req.body;
//     const tokenUserId = req.userId;

//     try {
//         const newPost = await prisma.post.create({
//             data:{
//                 ...body.postData,
//                 userId: tokenUserId,
//                 postDetait:{
//                     create:body.postDetail,
//                 },
//             },
//         });
//         res.status(200).json(newPost);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({message:"Failed to create post"});
//     }
// }
// export const updatePost = async (req,res) =>{
//     try {
//         res.status(200).json();
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({message:"Failed to update posts"});
//     }
// };
// export const deletePost = async (req,res) =>{
//     const id = req.params.id;
//     const tokenUserId = req.userId;

//     try {
//         const post = await prisma.post.findUnique({
//             where:{id},
//         });

//         if(post.userId !== tokenUserId){
//             return res.status(403).json({message:"Not Authorized!"});
//         }

//         await prisma.post.delete({
//             where: { id },
//         });

//         res.status(200).json({message:"Post deleted"});
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({message:"Failed to delete post"});
//     }
// }



import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 10000000,
        },
      },
    });

    // setTimeout(() => {
    res.status(200).json(posts);
    // }, 3000);
    return;//zedthaaaaaaaaaaaaaaaa
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({ ...post, isSaved: saved ? true : false });
        }
      }); return;
    }
    res.status(200).json({ ...post, isSaved: false });
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });


    res.status(200).json(newPost);
    // return;zy
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// export const updatePost = async (req, res) => {
//   try {
//     res.status(200).json();
//     // return;
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to update posts" });
//   }
// };

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId; // Assuming you have middleware to extract userId from token

  try {
    const { postData, postDetail } = req.body; // Extract postData and postDetail from request body

    // Retrieve the existing post by ID
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    // Check if the post exists
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the authenticated user is the owner of the post
    if (existingPost.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Update the post record with the new data
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...postData, // Update fields in postData
        postDetail: {
          update: postDetail, // Update the postDetail associated with the post
        },
      },
      include: {
        postDetail: true, // Include the updated postDetail in the response
      },
    });

    // Respond with the updated post data
    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};





export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
    // return;
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};