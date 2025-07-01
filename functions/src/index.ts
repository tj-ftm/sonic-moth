import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Example function for handling game scores
export const submitScore = onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const {walletAddress, score, displayName, gameSessionId} = req.body;

    if (!walletAddress || typeof score !== "number") {
      res.status(400).json({error: "Missing required fields"});
      return;
    }

    const db = admin.firestore();
    
    // Add score to leaderboard
    const scoreData = {
      wallet_address: walletAddress.toLowerCase(),
      score: score,
      display_name: displayName || "",
      game_session_id: gameSessionId || "",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("leaderboard_scores").add(scoreData);
    
    logger.info("Score submitted", {scoreId: docRef.id, walletAddress, score});
    
    res.status(200).json({
      success: true,
      scoreId: docRef.id,
    });
  } catch (error) {
    logger.error("Error submitting score", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Function to get leaderboard
export const getLeaderboard = onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const db = admin.firestore();
    
    const snapshot = await db
      .collection("leaderboard_scores")
      .orderBy("score", "desc")
      .orderBy("created_at", "asc")
      .limit(limit)
      .get();

    const scores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(scores);
  } catch (error) {
    logger.error("Error getting leaderboard", error);
    res.status(500).json({error: "Internal server error"});
  }
});