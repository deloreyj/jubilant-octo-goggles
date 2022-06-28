import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { User } from '.';
import { reviewQueueCollection, reviewsCollection } from './constants';

const updateReviewQueue = async (userId: string) => {
  functions.logger.info(`putting ${userId} back in the queue`);
  try {
    const reviewQueueDoc = await admin
      .firestore()
      .collection(reviewQueueCollection)
      .doc('Sundance')
      .get();
    const reviewQueue = reviewQueueDoc.data()!.users as User[];
    const index = reviewQueue.findIndex((user) => user.id === userId);
    reviewQueue.push(reviewQueue.splice(index, 1)[0]);
    await admin
      .firestore()
      .collection(reviewQueueCollection)
      .doc('Sundance')
      .update({ users: reviewQueue });
  } catch (e) {
    functions.logger.info('Im still alive');
    functions.logger.error(e);
    throw e;
  }
};

const getPendingReviewsForUser = (userId: string) => {
  return admin
    .firestore()
    .collection(reviewsCollection)
    .where('reviewer', '==', userId)
    .where('status', '==', 'pending')
    .get();
};

const getPendingReviewsList = () => {
  return admin
    .firestore()
    .collection(reviewsCollection)
    .where('status', '==', 'pending')
    .get();
};

const getReviewById = (reviewId: string) => {
  return admin.firestore().collection(reviewsCollection).doc(reviewId).get();
};

const getReviewQueue = () => {
  return admin
    .firestore()
    .collection(reviewQueueCollection)
    .doc('Sundance')
    .get();
};

const acknowledgeReview = (
  reviewId: string,
  userId: string,
  userName: string
) => {
  return admin.firestore().collection(reviewsCollection).doc(reviewId).update({
    status: 'acknowledged',
    reviewer: userId,
    reviewerName: userName,
  });
};

const createReview = (
  nextReviewerId: string,
  nextReviewerName: string,
  text: string,
  userId: string,
  userName: string
) => {
  return admin.firestore().collection(reviewsCollection).add({
    reviewer: nextReviewerId,
    reviewerName: nextReviewerName,
    status: 'pending',
    pr: text,
    requestor: userId,
    requestorName: userName,
  });
};

const assignNextReviewer = (
  reviewId: string,
  nextReviewerId: string,
  nextReviewerName: string
) => {
  return admin.firestore().collection(reviewsCollection).doc(reviewId).update({
    reviewer: nextReviewerId,
    reviewerName: nextReviewerName,
  });
};

export {
  updateReviewQueue,
  getPendingReviewsForUser,
  getPendingReviewsList,
  getReviewById,
  getReviewQueue,
  acknowledgeReview,
  createReview,
  assignNextReviewer,
};
