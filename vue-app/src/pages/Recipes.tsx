import {useState, useEffect} from 'react';
import {Container, ImageList, ImageListItem, ImageListItemBar} from '@mui/material';
import {Link} from "react-router-dom";


interface Recipe {
    name: string;
    ingredients?: Ingredient[];
    instructions?: string[];
    notes?: string;
}

interface Ingredient {
    name: string;
    quantity?: string;
    subIngredients?: Ingredient[];
    notes?: string;
}


function srcset(image: string, size: number, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${
            size * rows
        }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const Recipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [images, setImages] = useState<{ [key: string]: string }>({});

    const loadRecipes = async () => {
        const recipeFiles = import.meta.glob('../data/recipes/*.json');
        const recipeData = await Promise.all(
            Object.entries(recipeFiles).map(async ([path, resolver]) => {
                const recipe = await resolver();
                return recipe.default;
            })
        );

        setRecipes(recipeData);
    };

    const loadImages = async () => {
        const imageFiles = import.meta.glob('../data/images/*.png', {eager: true});
        const imageMap: { [key: string]: string } = {};

        for (const [path, module] of Object.entries(imageFiles)) {
            const fileName = path.split('/').pop()?.replace('.png', '');
            if (fileName) {
                imageMap[fileName] = (module as { default: string }).default;
            }
        }

        setImages(imageMap);
    };

    useEffect(() => {
        loadRecipes();
        loadImages();
    }, []);

    return (
        <div className={'container'}>
            <h3>recipes</h3>
            <ImageList variant="masonry" cols={4} gap={8}>
                {recipes.map((recipe: Recipe, index: number) => {
                    const imageUrl = images[recipe.name.replace(' ', '_').toLowerCase()] || '';
                    const cols = index % 2 == 0 ? 2 : 1;
                    const rows = index % 2 == 0 ? 2 : 1;

                    return (
                        <Link key={index} to={`/recipes/${recipe.name.replace(' ', '-')}`}>
                            <ImageListItem key={index} rows={rows} cols={cols} sx={{height: 60}}>
                                <img
                                    srcSet={`${imageUrl}?h=12&fit=crop&auto=format&dpr=2 2x`}
                                    src={`${imageUrl}?h=12&fit=crop&auto=format`}
                                    alt={recipe.name}
                                    loading="lazy"
                                    style={{borderRadius: 12}}
                                />
                                <ImageListItemBar
                                    position={'bottom'}
                                    title={recipe.name.replaceAll('_', ' ')}
                                    subtitle={'@bmontijo'}
                                    sx={{borderRadius: '0px 0px 12px 12px'}}
                                />
                            </ImageListItem>
                        </Link>
                    );
                })}
            </ImageList>
        </div>
    )
        ;
};

export {
    Recipes,
    Ingredient,
    Recipe
};
