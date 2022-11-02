const { SlashCommandBuilder } = require( "discord.js" );
const fs = require( "fs" );

if ( !fs.existsSync( "./databases/tags.json" ) ) {
    fs.writeFileSync( "./databases/tags.json", "{}" );
}

const tags = JSON.parse( fs.readFileSync( "./databases/tags.json" ) );
const checkUserPerms = require( "../utils/checkUserPerms" );

module.exports = {
    data: new SlashCommandBuilder()
        .setName( "tag" )
        .setDescription( "Manage tags" )
        .addSubcommand( ( subcommand ) =>
            subcommand
                .setName( "add" )
                .setDescription( "Add a tag" )
                .addStringOption( ( option ) => option.setName( "name" ).setDescription( "The name of the tag" ).setRequired( true ) )
                .addStringOption( ( option ) => option.setName( "content" ).setDescription( "The content of the tag" ).setRequired( true ) )
        )
        .addSubcommand( ( subcommand ) =>
            subcommand
                .setName( "remove" )
                .setDescription( "Remove a tag" )
                .addStringOption( ( option ) => option.setName( "name" ).setDescription( "The name of the tag" ).setRequired( true ).setAutocomplete( true ) )
        )
        .addSubcommand( ( subcommand ) => subcommand.setName( "list" ).setDescription( "List all tags" ) )
        .addSubcommand( ( subcommand ) =>
            subcommand
                .setName( "get" )
                .setDescription( "Get a tag" )
                .addStringOption( ( option ) => option.setName( "name" ).setDescription( "The name of the tag" ).setRequired( true ).setAutocomplete( true ) )
        ),

    async execute ( interaction ) {
        const subcommand = interaction.options.getSubcommand();
        if ( subcommand === "add" ) {
            if ( !checkUserPerms( interaction ) ) {
                return interaction.reply( {
                    content: "You do not have permission to do that!",
                    ephemeral: true
                } );
            }
            const name = interaction.options.getString( "name" );
            const content = interaction.options.getString( "content" );
            if ( tags[ name ] ) {
                return interaction.reply( { content: `A tag with the name ${ name } already exists.`, ephemeral: true } );
            }
            tags[ name ] = content;
            fs.writeFileSync( "./databases/tags.json", JSON.stringify( tags, null, 4 ) );
            interaction.reply( { content: `Added tag ${ name }.`, ephemeral: true } );
        } else if ( subcommand === "remove" ) {
            if ( !checkUserPerms( interaction ) ) {
                return interaction.reply( {
                    content: "Just don't use that tag then ¯\\_(ツ)_/¯ (You don't have permission to do that.)",
                    ephemeral: true
                } );
            }
            const name = interaction.options.getString( "name" );
            if ( !tags[ name ] ) {
                return interaction.reply( { content: `A tag with the name ${ name } does not exist.`, ephemeral: true } );
            }
            delete tags[ name ];
            fs.writeFileSync( "./databases/tags.json", JSON.stringify( tags, null, 4 ) );
            interaction.reply( { content: `Removed tag ${ name }.`, ephemeral: true } );
        } else if ( subcommand === "list" ) {
            const tagList = Object.keys( tags ).join( ", " );
            if ( tagList.length === 0 ) {
                return interaction.reply( { content: "There are no tags.", ephemeral: true } );
            }
            interaction.reply( { content: tagList, ephemeral: true } );
        } else if ( subcommand === "get" ) {
            const name = interaction.options.getString( "name" );
            if ( !tags[ name ] ) {
                // Shhhh, you didn't see anything.
                if (name === "sbeve is amazing") {
                    return interaction.reply( { content: "I know, right!", ephemeral: true } );
                }

                return interaction.reply( { content: `A tag with the name ${ name } does not exist.`, ephemeral: true } );
            }
            interaction.reply( { content: tags[ name ] } );
        }
    }
};
