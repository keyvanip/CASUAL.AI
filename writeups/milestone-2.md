# Milestone 2

## Data Preparation

### Step 1

We will source our initial dataset from Kaggle: [Clothes Dataset](https://www.kaggle.com/datasets/gustavofadel/clothes-dataset/data). 

Additional data can be incorporated later to improve classification accuracy and enhance model performance.  

### Step 2

After collecting the dataset, we will create a structured metadata file containing essential attributes for each image, including:  

- **File Name**  
- **Category** (e.g., shirts, pants, etc.)  
- **Color**  
- **Style** (e.g., casual, formal, sporty, etc.)  
- **Gender** (e.g., men, women)

This metadata will serve as a crucial component for training the model, ensuring that our deep learning model learns to recognize patterns effectively.  

### Step 3

To classify clothing attributes accurately, we will train a **Convolutional Neural Network (CNN)** model. 

The CNN will be designed to recognize patterns, textures, and styles in images, enabling it to categorize clothing based on gender, style, and color.  

## RAG Implementation Summary

### Retrieval Stage:

- We store users' wardrobe embeddings (tops and bottoms) using FAISS.
- These embeddings are generated using CLIP or Vision Transformer models to effectively capture visual and style features.
- During retrieval, the system fetches the most suitable outfit combinations based on factors like weather conditions, occasion (casual, formal, evening), and the user’s past preferences.

### Augmented Generation Stage:

- The retrieved outfit combinations are then passed to an LLM (such as GPT or LLaMA) which generates personalized explanations for each suggestion.
- The LLM can describe why an outfit was chosen, factoring in user style, weather, and event context—providing a human-like stylist feel.
  
### Evaluation:

- The RAG system will be evaluated based on relevance (whether the retrieved outfits align with occasion and weather), diversity (varied outfit combos), and user satisfaction from feedback.
- Continuous improvement can be done by fine-tuning retrieval on user feedback loops and refining generation prompts for better personalization.