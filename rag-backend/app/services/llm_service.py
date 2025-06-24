import google.generativeai as genai
import os

# Configure your API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_answer(query, context):
    model = genai.GenerativeModel('gemini-1.5-flash')  # Or 'gemini-1.5-pro'
    prompt = f"""Answer based only on the context below. If the answer is not in the context, say "I don't know".
                Context:
                {context}
                Question:
                {query}
                """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating answer: {e}"

def generate_title(query):
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f""" Only return a 5 word response for the query i will be providing you , This will be the title of the chat.
                query:{query}    
                Do not make it long and do not go over 7 words, try to keep it under the word count.
            """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(e)
        return f"Error generating answer: {e}"